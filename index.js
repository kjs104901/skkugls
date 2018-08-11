const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater')
const { download } = require('electron-dl');

const portal = require("./node_my_modules/portal");
const gls = require("./node_my_modules/gls");

const colorSkkuBackground = "#1B484F";
const colorSkkuBackgroundDoom = "#3D7178";
const colorSkkuBackgroundDeep = "#1C414A";
const colorSkkuLogo = "#FFD661";

//// ------------ Development ------------ ////

const isDevelopment = false;

//// ------------ Windows ------------ ////
let loginWindow;
let loginWindowSetting = {
    width: 450, height: 550,
    frame: false,
    show: false,
    resizable: false,
    backgroundColor: colorSkkuBackground,
    icon: "./html/icon.ico"
};

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// single instance
var shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
    let windowCount = 0;
    if (loginWindow) {
        if (!loginWindow.isDestroyed()) {
            windowCount += 1;

            if (loginWindow.isMinimized()) loginWindow.restore();
            loginWindow.focus();
        }
    }
    if (windowCount === 0) {
        loginWindowOpen();
    }
});

if (shouldQuit) {
    app.quit();
    return;
}

app.on('ready', () => {
    autoUpdater.checkForUpdatesAndNotify();
    loginWindowOpen();
});

app.on('window-all-closed', () => {
    loginWindow = null;
    app.quit();
})

//// ------------ Windows ------------ ////

const loginWindowOpen = () => {
    if (loginWindow) {
        if (!loginWindow.isDestroyed()) {
            loginWindow.close();
        }
    }
    if (isDevelopment) {
        loginWindowSetting.width = 1200;
        loginWindowSetting.height = 600;
    }

    loginWindow = new BrowserWindow(loginWindowSetting);
    loginWindow.loadFile('./html/login.html');

    loginWindow.once('ready-to-show', () => {
        loginWindow.show();
        if (isDevelopment) {
            loginWindow.webContents.openDevTools();
        }
    })
}

const glsDownloadStart = (callback) => {
    const glsInstallURL = "https://admin.skku.edu/co/jsp/installer/MiPlatformInstallEngine320U_SKKU.exe";
    if (loginWindow) {
        if (!loginWindow.isDestroyed()) {
            download(loginWindow, glsInstallURL, {
                onProgress: (percent) => {
                    if (loginWindow) {
                        if (!loginWindow.isDestroyed()) {
                            loginWindow.webContents.send('glsProgress', percent);
                        }
                    }
                }
            })
                .then((dl) => {
                    if (loginWindow) {
                        if (!loginWindow.isDestroyed()) {
                            loginWindow.webContents.send('glsFinished', dl.getSavePath());
                        }
                    }
                })
                .catch(() => {
                    callback({
                        err: "downloadFailed",
                        errMessage: "다운로드 실패"
                    })
                })
        }
    }
}

//// ------------ User Info ------------ ////
let userId = "";
let userPass = "";

//// ------------ Timeout ------------ ////

const reserveTimeoutSend = (sender, messageType, timeoutSecond, callback) => {
    const timeout = setTimeout(() => {
        timeoutSent = true;
        if (!sender.isDestroyed()) {
            sender.send(messageType, {
                err: "timeOut",
                errMessage: "요청 시간이 초과되었습니다"
            })
        }
        callback();
    }, timeoutSecond * 1000);

    return timeout;
};

const checkLoginElseTryPortal = (callback) => {
    portal.loginCheck((result) => {
        if (result == true) {
            callback(true);
        }
        else {
            portal.login(userId, userPass, (result) => {
                if (result) {
                    callback(true);
                }
                else {
                    callback(false);
                }
            });
        }
    })
}

//// ------------ IPC frontend ------------ ////
ipcMain.on("checkGLSInstalledReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "checkGLSInstalledRes", 10, () => {
        timeoutSent = true;
    })

    checkGLSInstalledRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("checkGLSInstalledRes", result);
        }
    });
})

ipcMain.on("loginReq", (event, message) => {
    userId = message.userId;
    userPass = message.userPass;

    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "loginRes", 10, () => {
        timeoutSent = true;
    })

    loginRequest(userId, userPass, (result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("loginRes", result);
        }
    });
});

ipcMain.on("openGLSReq", (event, message) => {
    let timeoutSent = false;
    const timeout = reserveTimeoutSend(event.sender, "openGLSRes", 10, () => {
        timeoutSent = true;
    });

    openGLSRequest((result) => {
        clearTimeout(timeout);
        if (timeoutSent === false) {
            event.sender.send("openGLSRes", result);
        }
    });
});

ipcMain.on("glsDownloadStartReq", (event, message) => {
    glsDownloadStart((result) => {
        event.sender.send("glsDownloadStartRes", result);
    });
})

//// ------------ IPC backend functions ------------ ////
////// for action
const checkGLSInstalledRequest = (callback) => {
    const isInstalled = gls.checkInstalled();
    if (isInstalled) {
        callback({
            data: true
        })
    }
    else {
        callback({
            data: false
        })
    }
}

const loginRequest = (userId, userPass, callback) => {
    portal.login(userId, userPass, (result) => {
        if (result) {
            callback({
                data: {
                    success: true
                }
            })
        }
        else {
            callback({
                err: "loginFailed",
                errMessage: "로그인에 실패했습니다"
            });
        }
    });
}

const openGLSRequest = (callback) => {
    const isInstalled = gls.checkInstalled();
    if (isInstalled) {
        checkLoginElseTryPortal((result) => {
            if (result) {
                portal.getGlobalVal((globalVal) => {
                    if (0 < globalVal.length) {
                        gls.setGlobalVal(globalVal, (result) => {
                            if (result == true) {
                                gls.setImage();
                                gls.executeGLS((result) => { });

                                callback({
                                    data: {
                                        success: true
                                    }
                                })
                            }
                            else ({
                                err: "regFailed",
                                errMessage: "레지스트리 수정 불가"
                            })
                        });
                    }
                    else {
                        callback({
                            err: "getGlobalValFailed",
                            errMessage: "인증정보를 얻지 못했습니다"
                        });
                    }
                })
            }
            else {
                reLoginFailed();
            }
        });
    }
    else {
        callback({
            err: "glsNotInstalled",
            errMessage: "GLS가 설치되어 있지 않습니다"
        })
    }
}