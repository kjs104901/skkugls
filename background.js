      
chrome.storage.sync.set({globalVal: ""});

chrome.contentSettings.javascript.set({
  'primaryPattern': 'https://admin.skku.edu/*',
  'setting': 'block' //block allow
});

var downcount = 0;

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (tab.url == 'https://admin.skku.edu/co/COCOUsrLoginAction.do') {
    if (changeInfo.status == 'complete') {
      chrome.tabs.executeScript(tabId, {
        file: "login.js",
        runAt: "document_end"
      })
    }
  }
  if (tab.url == 'https://admin.skku.edu/co/COCOUsrLoginAction.do?method=loginGenMP') {
    if (changeInfo.status == 'loading') {
      chrome.tabs.executeScript(tabId, {
      file: "gls.js",
      runAt: "document_start"},
      function(){
        chrome.storage.sync.get(function(data) {

          //alert(data.globalVal);
          strGlobalVal = data.globalVal;
          //console.log("strGlobalVal: "+strGlobalVal);
          start();

          setTimeout(function(){
            finish();
          },3000);
        });
      });
    }
  }
})

var objMP = {};
var xhrObject = null;      
var xhrCreateObject = null;
var openurl = "http://127.0.0.1";        //고정(변경불가)
var setport = -1;                        //-p옵션을 통해 넣었던 포트번호가 있으면 그 번호를 넣어야 함; 없을 경우는 -1값 넣어야 동작함
var openport = -1;                       //openport가 실패할 경우 시도할 처음 port 번호
var findport = false;                    //setport 혹은 쿠키값으로 먼제 port 찾을때 false;
var openurl_add = "/launcher/miplatform";//고정(변경불가)
var add_value = false;                   //json value 값을 직접 문자열 더하기 방식으로 만들지 여부
var is_jsonp = false; //jsonp방식으로 통신을 원하지 않으면 false => IE6,7 사용시 true
var jsonp_node = null;
var is_file = false;                      //file를 로드하는지 서버꺼를 로드하는지 여부;ie일때만 사용
var console = window.console || {log:function(){}}; 
var isCheckInsatll = false; // TPLSvc laucher 최초 로딩 시 설치 유무 확인 위한 flag

//<!-- 사용자의 환경에 맞게 세팅 필요 start -->
// [ 3.2 버전 start ~! ] 
var strBaseURL = "http://admin.skku.edu";
var strExePath = "%TOBE%//MiPlatform320U//MiPlatform320U.exe";        //바로가기의 대상이 되는 실행 파일명
var strUpdaterExePath = "%system%MiUpdater321.exe"; 
var strExeName = "%system%MiUpdater321.exe"; 
var strShortcutName = "CodeSamples(S)";                                    //바로가기 이름      
var strKey = "skku";                                         //key값(필수)
var strStartXML = strBaseURL + "/co/mp/start.xml";            //Miplatform에서 사용할 StartXML의 경로(필수)
var strCommand = "-L TRUE -R FALSE -D WIN32U -V 3.2 -K "+strKey+" -X "+strStartXML+" -Wd 1024 -Ht 768"; //대상 실행파일이 실행될 때 입력될 인자값      
var strVersion = "3.2";                                               //제품버전(필수)      
var bOnlyOne = false;
var intTimeout = 3600;
var bPreVersionCompare = false;
// [ 3.2 버전 end ~! ] 

var strUpdateURL = strBaseURL + "/co/jsp/installer/Miplatform320U_20151207/update_xp_config.xml";       //update info file의 URL(필수)
var strComponentPath = "%UserApp%TobeSoft\\"+strKey+"\\components"; //Miplatform 에서 사용되는 component 경로
var strResource = "%component%resource.xml";                           //Miplatform 에서 사용되는 Resource 파일 경로
var strStartImage = "%component%next_start.gif";      								 //Miplatform 용 splash화면에 표시될 이미지
var strDeviceType = "WIN32U";                                          //배포 대상이 되는 장치를 지정하는 값(필수)
var strPos = "desktop";                                                //바로가기 생성될 위치
var strAliasToRealPath = "%TOBE%";
var strGlobalVal = "";
var strIConPath = "%APPDATA%icon_next.ico";         //바로가기의 아이콘 파일      

var strLocLuncherVer;                       //런처 local 버전
var strLauncherVersion = "1,0,0,1";         //런처 버전
var strLauncherDownloadPath = "/newLauncher/launcherservice_files/1.0.0.1"; // 런처 서버 다운로드 경로      
//<!-- 사용자의 환경에 맞게 세팅 필요 end -->

  
try {
  JSON.stringify(objMP);  //객체를 문자열로 변환
} catch(e) {
  add_value = true;
}


function start()
{

objMP = {};
xhrObject = null;      
xhrCreateObject = null;
openurl = "http://127.0.0.1";        //고정(변경불가)
setport = -1;                        //-p옵션을 통해 넣었던 포트번호가 있으면 그 번호를 넣어야 함; 없을 경우는 -1값 넣어야 동작함
openport = -1;                       //openport가 실패할 경우 시도할 처음 port 번호
findport = false;                    //setport 혹은 쿠키값으로 먼제 port 찾을때 false;
openurl_add = "/launcher/miplatform";//고정(변경불가)
add_value = false;                   //json value 값을 직접 문자열 더하기 방식으로 만들지 여부
is_jsonp = false; //jsonp방식으로 통신을 원하지 않으면 false => IE6,7 사용시 true
jsonp_node = null;
is_file = false;                      //file를 로드하는지 서버꺼를 로드하는지 여부;ie일때만 사용
console = window.console || {log:function(){}}; 
isCheckInsatll = false; // TPLSvc laucher 최초 로딩 시 설치 유무 확인 위한 flag

strBaseURL = "http://admin.skku.edu";
strExePath = "%TOBE%//MiPlatform320U//MiPlatform320U.exe";        //바로가기의 대상이 되는 실행 파일명
strUpdaterExePath = "%system%MiUpdater321.exe"; 
strExeName = "%system%MiUpdater321.exe"; 
strShortcutName = "CodeSamples(S)";                                    //바로가기 이름      
strKey = "skku";                                         //key값(필수)
strStartXML = strBaseURL + "/co/mp/start.xml";            //Miplatform에서 사용할 StartXML의 경로(필수)
strCommand = "-L TRUE -R FALSE -D WIN32U -V 3.2 -K "+strKey+" -X "+strStartXML+" -Wd 1024 -Ht 768"; //대상 실행파일이 실행될 때 입력될 인자값      
strVersion = "3.2";                                               //제품버전(필수)      
bOnlyOne = false;
intTimeout = 3600;
bPreVersionCompare = false;

strUpdateURL = strBaseURL + "/co/jsp/installer/Miplatform320U_20151207/update_xp_config.xml";       //update info file의 URL(필수)
strComponentPath = "%UserApp%TobeSoft\\"+strKey+"\\components"; //Miplatform 에서 사용되는 component 경로
strResource = "%component%resource.xml";                           //Miplatform 에서 사용되는 Resource 파일 경로
strStartImage = "%component%next_start.gif";                       //Miplatform 용 splash화면에 표시될 이미지
strDeviceType = "WIN32U";                                          //배포 대상이 되는 장치를 지정하는 값(필수)
strPos = "desktop";                                                //바로가기 생성될 위치
strAliasToRealPath = "%TOBE%";
//strGlobalVal = "";
strIConPath = "%APPDATA%icon_next.ico";         //바로가기의 아이콘 파일      

strLocLuncherVer;                       //런처 local 버전
strLauncherVersion = "1,0,0,1";         //런처 버전
strLauncherDownloadPath = "/newLauncher/launcherservice_files/1.0.0.1"; // 런처 서버 다운로드 경로      

try {
  JSON.stringify(objMP);
} catch(e) {
  add_value = true;
}
    //생성 및 id 할당
    //alert("생성 및 id 할당");
    objMP.platform = 'miplatform'; //필수 세팅
    objMP.action = 'create';      //필수 세팅
    //objMP.id = '';              // 통신이 성공하면 정보가 채워지므로 생략해도 무방
    
    if (setport > 0)
        openport = setport;
    else 
        openport = parseInt(getCookie("tplsvcopenport"), 10) | 0;
    
    if (openport > 0) {
       findport = false;
    } else {
       findport = true;
       openport = 7895;
    } 
    
    sendData(true, true, createProcess);

}


function finish()
{
    //종료 ==> 종료는 생략할 수 있으나 런처 서비스에서 관련 정보를 일정 시간 동안 가지고 있지 않게 하려면 호출해야 함;
    //alert("종료");
    objMP.action = 'destroy';
    //sendData(true);     
    sendData(true, false, resultProcess);
} 

function setCookie( name, value, expiredays ) 
{
var todayDate = new Date(); 
todayDate.setDate( todayDate.getDate() + expiredays ); 
document.cookie = name + '=' + escape( value ) + '; path=/; expires=' + todayDate.toGMTString() + ';';
}

function getCookie( name )
{ 
  var nameOfCookie = name + '='; 
  var x = 0; 
  while ( x <= document.cookie.length ) { 
    var y = (x+nameOfCookie.length); 
  if ( document.cookie.substring( x, y ) == nameOfCookie ) { 
    if ( (endOfCookie=document.cookie.indexOf( ';', y )) == -1 ) 
      endOfCookie = document.cookie.length; 
      return unescape( document.cookie.substring( y, endOfCookie ) ); 
          } 
    x = document.cookie.indexOf( ' ', x ) + 1; 
    if ( x == 0 ) 
        break; 
  } 
  return ''; 
}

function sendData(openpost, is_create, resultCallback) 
{
    if (is_jsonp == false) {
        if (is_create && xhrCreateObject != null) {
            delete xhrCreateObject;
            xhrCreateObject = null;      
        } else if (is_create == false && xhrCreateObject != null){
            delete xhrObject;
            xhrObject = null;      
        }
        
//XMLHttpRequest, XDomainRequest(ie8,9,10) 객체로 서버와 연결하기 위해 사용한다
//W3C에서 낸 CORS 를 사용해서 CrossDomain 데이터처리 할때, XMLHttpRequest(이하 XHR)이없는 IE계열에서는 
//IE8+ 부터 XDomainRequest(이하 XDR)를 사용해서 CORS를 지원한다고 합니다.
//따라서, IE8,9,10 버전에서 돌아가도록 하기위해 XDomainRequest 프로토콜을 추가로 사용합니다.          
        var sendObj = null;
        if (is_file) {
            if (window.XMLHttpRequest) {
                sendObj = new XMLHttpRequest();
                sendObj.reqType = 1;
            } else if (window.XDomainRequest) {
                sendObj = new XDomainRequest();
                sendObj.reqType = 2; 
            }         
        } else {
            if (window.XDomainRequest) {
                sendObj = new XDomainRequest();
                sendObj.reqType = 2;
            } else if (window.XMLHttpRequest) {
                sendObj = new XMLHttpRequest();
                sendObj.reqType = 1;          
            }
        } 
        
//IE7 이상 버전이나 다른 브라우저들은 XMLHttpRequest 객체를 바로 생성하면 되지만
//IE6 이하 버전은 XMLHttpRequest지원안되기 때문에 대신 ActiveX형식으로 가능합니다.
//따라서, ActiveXObject 객체를 통해서 생성하여 연결합니다          
        if (sendObj == null && window.ActiveXObject) {
      //IE는 ActivXObject를 사용해서 HTTP 통신을 하며 두 종류의 객체가 있다.
      //Msxml2.XMLHTTP,Microsoft.XMLHTTP 가 있으며,  Msxml2.XMLHTTP는 5.0 이후 버전이고,
      //Microsoft.XMLHTTP 는 5.0이전버전이다. 그런데, Microsoft.XMLHTTP를 사용하지 않는다는 보장이 없으므로
      //두 종류를 포함하여 XMLHttpRequest를 정의해야 한다.
            try {
              sendObj = new ActiveXObject("Microsoft.XMLHTTP");
              sendObj.reqType = 3;
            } catch(e) {
              sendObj = new ActiveXObject("Msxml2.XMLHTTP"); 
              sendObj.reqType = 4;
            }
        }

        if (sendObj == null) {
          return null;
        }
         
        if (is_create) {
          xhrCreateObject = sendObj;
        }
        else {
          xhrObject = sendObj;
        }
          
        if (sendObj.reqType != 2) {
          sendObj.onreadystatechange = resultCallback;
        }
        else {
          sendObj.onload = resultCallback;         
          sendObj.onerror = http_onerror;
          sendObj.ontimeout = http_ontimeout;         
        }
    } 

    var jsonData;

    if (add_value) {
      jsonData = '{"platform":"miplatform"';
      jsonData += ',"action":"' + objMP.action + '"';
      if (objMP.action != 'create')  {
          jsonData += ',"id":"' + objMP.id + '"';
          if (objMP.action != 'destroy') {
              jsonData += ',"value":' + objMP.value; //???
          }
      }
      jsonData += '}';
    
    } else {
      jsonData = JSON.stringify(objMP);
    }
    
    var timestamp = "/" + new Date().getTime();//cache 방지용
    var send_url = openurl + ":" + openport + openurl_add + timestamp;
   
  /**
   *  jsonp 사용 시 이용
   */
  if (is_jsonp) {
  //var jsc_u = send_url + "?callback=" + jsonp_result.name + "&" + encodeURIComponent(jsonData); //jsonp_result 함수 호출;


  var jsc_u = send_url + "?callback=" + "jsonp_result" + "&" + encodeURIComponent(jsonData); //jsonp_result는 콜백함수명;
  
  if (jsonp_node == null) {
      jsonp_node = document.createElement('script');
  } else {
    document.getElementsByTagName('body')[0].removeChild(jsonp_node);
    delete jsonp_node;
    jsonp_node = document.createElement('script');
  }

  try {
      jsonp_node.setAttribute('src', jsc_u);
      jsonp_node.setAttribute('type', 'text/javascript');
      jsonp_node.onerror = http_onerror; 
      document.getElementsByTagName('body')[0].appendChild(jsonp_node);
  } catch (e) {
      console.log("jsonp error");
  }

  } 
  else {
        if (sendObj.reqType != 2)    {
            if (openpost) {
                sendObj.open("POST", send_url, "true");
                sendObj.send(jsonData);
            } else {
                sendObj.open("GET", send_url + "?" + jsonData, "true");
                sendObj.send(null);
            }
        } else {
            if (openpost) {
                sendObj.open("POST", send_url);
                sendObj.send(jsonData);
            } else {
                sendObj.open("GET", send_url);
                sendObj.send(jsonData);
            }       
        }
        return sendObj;
  }
}



/**
 * @param  {[type] json string}
 * 
 */
function jsonp_result(result) 
{
    var isDoflag = false;
    console.log(result);
    if (launcher_response(result)) {
        if (objMP.action == 'create') {
          setCookie("tplsvcopenport", openport, 14);
          //txtResult.value = objMP.action + " id = " + objMP.id + "\n" + txtResult.value;
        } else {
            try {
                //txtResult.value = objMP.action + " value = " + JSON.stringify(objMP.value) + "\n" + txtResult.value;

                // 추가 내용
                var reg = new RegExp(strVersion,"i");
                var rtnJson = objMP.value["getengineversion"].result;
                var strEgine = reg.test(rtnJson);
                //alert("getengineversion : " + rtnJson + " : " + strEgine) 
                if(!strEgine) {
                  //alert("Please istall XPlaform \nthan close browser and run browser again");
                  //document.location = download_TPLSvc();
                }
                  if(isDoflag==false) {
                  //is_jsonp=false;
                  
                  isDoflag = true;
                }  

            } catch(e) {
                //txtResult.value = objMP.action + " value = " + objMP.value + "\n" + txtResult.value;
              //txtResult.value = result + "\n" + txtResult.value; 
            }              
        }
    } else {
      if (objMP.action == 'create') {
          http_onerror();
    
      }else{    
          //txtResult.value = result + "\n" + txtResult.value;
} 
    }
              
}



function createProcess()
{
    if ( xhrCreateObject.readyState == 4 || xhrCreateObject.reqType == 2)  {
        console.log(xhrCreateObject.responseText);
        if ((xhrCreateObject.status == 200 || xhrCreateObject.reqType == 2) && launcher_response(xhrCreateObject.responseText) ) {
            setCookie("tplsvcopenport", openport, 14);
            //txtResult.value = objMP.action + " id = " + objMP.id + "\n" + txtResult.value;
            
          /**
           * TPLSvc laucher 의 버전 정보를 가져오기 위한 json param 전달
           */
          if(!isCheckInsatll) {
            objMP.action = 'check';
            if (add_value) {
                objMP.value = '{"getlauncherversion" : { }}';    
            } else {
                objMP.value = {"getlauncherversion" : { }};              
            }

            sendData(true, false, resultProcess);
          }

          return;
        }
       
       return http_onerror();
    }          
}



function http_onerror()
{
    
    try {
        strLocLuncherVer = objMP.value["getlauncherversion"].productversion;
        if (!strLocLuncherVer) {
        //alert('Please Insall TPLSvc Laucher \n than Plese close Browser and Run again');
        //document.location = download_TPLSvc();
        isCheckInsatll = true;
      }
    }
    catch(e) {
        /**
         * TPLSvc laucher 의 버전 정보를 가져오기 위한 json param 전달
         */
        if(!isCheckInsatll) {
          objMP.action = 'check';
          if (add_value) {
              objMP.value = '{"getlauncherversion" : { }}';    
          } else {
              objMP.value = {"getlauncherversion" : { }};              
          }

          sendData(true, true, createProcess);
        }
    }
    
    if (objMP.action == 'create') {
        if (findport == false) {
          if ( setport > 0) {
              setport = 0;
              openport = parseInt(getCookie("tplsvcopenport"), 10) | 0;
              if (openport > 0) {
                  sendData(true, true, createProcess);
                  return;
              }
          }
          openport = 7895;
        } else {
          openport++;

        }
        findport = true;
          
        if (openport <= 7935) {//신규 런처는 7895 ~ 7935 사이 하나의 port를 open 함; 
          sendData(true, true, createProcess);
        }
        else {
          //alert("런처 서비스가 설치되지 않았거나 동작이 멈춰있는지 확인 바랍니다.");
        }
     }     
}

function http_ontimeout()
{
  return http_onerror();
}

function resultProcess()
{   
    var isDoflag = false; // loop 방지

    if (xhrObject.reqType == 2 || (xhrObject.readyState == 4 && xhrObject.status == 200) ) {
        console.log(xhrObject.responseText);
        var ret = launcher_response(xhrObject.responseText);

        /**
         *  TPLSvc laucher 설치 유무 확인
         */
        if(!isCheckInsatll) {
          strLocLuncherVer = objMP.value["getlauncherversion"].productversion;
          if(strLauncherVersion > strLocLuncherVer) {
            //alert('Please Update New TPLSvc Laucher \n than Plese close Brower and Run again');
            //document.location = download_TPLSvc();
          }
          isCheckInsatll = true;
        }

        if(isDoflag==false) {
          is_jsonp = true;
          do_property('setproperty', 'basic');
          do_property('setproperty', 'contactInfo');
          //do_method('download');
          do_method('launch');
          //do_method('makeshortcut');
          
          isDoflag=true;
        }

        if (ret == false)
        {
            if (objMP.action == "create")
            {
                //alert("런처 서비스가 설치되지 않았거나 동작이 멈춰있는지 확인 바랍니다.");
            }
        }
        else
        {
            try {
        
        //txtResult.value = objMP.action + " value = " + JSON.stringify(objMP.value) + "\n" + txtResult.value;
        //strLocLuncherVer = objMP.value["getlauncherversion"].productversion;
       
            } catch(e) {
        //txtResult.value = xhrObject.responseText+ "\n" + txtResult.value;
            }
        }
    }
}

function launcher_response(result) {
    //var result = resultObject.responseText;
    if (result.length <= 0)
      return false;
    try {
        var objResult = JSON.parse(result);
        //var objResult = eval('(' + result + ')');
        if (objResult.result == "success" && objResult.id.length > 0) {
            objMP = objResult;
            return true;
        }
        else {
            //txtResult.value = "launcher_response error msg = " + objResult.result + "\n" + txtResult.value;
            return false;
        }
    } catch (e) {
      return false;
    }
}


//n millis 동안 멈추기
function pause(numberMillis) 
{
var now = new Date();
var exitTime = now.getTime() + numberMillis;


while (true) {
    now = new Date();
    if (now.getTime() > exitTime)
        return;
   }
}

// TPLSvc.exe 다운 받기
function download_TPLSvc() {
  var downURL = strBaseURL + strLauncherDownloadPath + "/TPLSvc_Setup.exe";
  return downURL;
}  

function do_property(action, action_sub)
{           
  console.log(action+" // "+action_sub);
    if (action == 'setproperty') {
        //property 설정 ==> action = 'property' value = {"property명" : "property값", ... };
        objMP.action = 'setproperty';
        if (action_sub == 'basic')
            // 대소문자 구분 잘해서 사용!!!                        
            objMP.value = {"Version": strVersion, "DeviceType":strDeviceType, "Key": strKey };
         else {
            // 대소문자 구분 잘해서 사용!!!
            objMP.value = {"StartXML": strStartXML, "Width":"1024","Height":"768",
                           "UpdateURL": strUpdateURL, "ComponentPath": strComponentPath, "Resource": strResource, 
                           "GlobalVal": strGlobalVal, "StartImage": strStartImage,
                           "ReInstall": true, "Left":10, "Top":10, 
                           "OnlyOne": bOnlyOne, "SiteKey":strKey,
                           "Retry":0, "TimeOut":intTimeout, "PreVersionCompare":bPreVersionCompare 
                          };
                
            // MP는 따로 enginesetupkey를 사용하지 않음. Version이나 DeviceType으로 3.2/3.3 구분 사용 U/A는 DeviceType에 영향
        }       
            
        
    }
    else if (action == 'getproperty') {
        if(action_sub =='all'){
        //property 설정 ==> action = 'property' value = {"property명" : "property값", ... };
        objMP.action = 'getproperty';
        
        // 대소문자 구분 잘해서 사용!!!
        objMP.value = {
            "Key": "", "StartXML": "" , "Width":"", "Height":"", "Left":"", "Top":"", "Resource":"", 
            "UpdateURL":"", "ComponentPath":"", "StartImage":"",
            "Version": "", "DeviceType":"", "ReInstall":"",
            "OnlyOne": "", "SiteKey":"", 
            "Retry":"", "TimeOut":"", "Launch":"", "PreVersionCompare":"",
            };
       }
   } 
     else
         return;


    sendData(true, false, resultProcess);
}
    

function do_method(action) {
  console.log(action+" // ");

    if (action == 'check') { //'getlauncherversion') {
        objMP.action = 'check';
        
        // 대소문자 구분 잘해서 사용!!!
        objMP.value = {"getlauncherversion" : { }};  
       
    } else {
     
      objMP.action = 'method';
      if (action == 'makeshortcut') {
          //method 실행 ==> action = 'method' value = {"method명" : {"param" : method 입력값 array }};
          objMP.value = { "MakeShortCut": { "param": [strUpdaterExePath, strCommand, strShortcutName, strIConPath, strPos]}}; //MP는 XP처럼 공용/자신만 사용가능한 아이콘 생성 미지원                            
      }
      else if (action == 'launch') {
          //method 실행 ==> action = 'method' value = {"method명" :  };
          objMP.value = { "Run": ""};
      }
      else if (action == 'download') {
          //method 실행 ==> action = 'method' value = {"method명" : };
          //objMP.value = { "StartDownload": "", "OnError":{ "param": [ "DownFileName", "ErrorCode", "ErrorMsg"], "result":"" } };
          objMP.value = { "StartDownload": { "result":""}};
      }
   }
    sendData(true, false, resultProcess);
}
