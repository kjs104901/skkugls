
console.log(document);

if (document.head.innerText.indexOf("document.loginForm.D1.value") != -1)
{
	temp_str = document.head.innerText;
	console.log(temp_str);

	D1 = temp_str.split('document.loginForm.D1.value = "')[1].split('"')[0];
	roundkey = temp_str.split('document.loginForm.roundkey.value = "')[1].split('"')[0];
	D3 = temp_str.split('document.loginForm.D3.value = "')[1].split('"')[0];
	type = temp_str.split('document.loginForm.type.value = "')[1].split('"')[0];


	document.getElementsByName("D1")[0].value = D1;
	document.getElementsByName("roundkey")[0].value = roundkey;
	document.getElementsByName("D3")[0].value = D3;
	document.getElementsByName("type")[0].value = type;

	loginFormTmp = document.getElementsByName("loginForm")[0];
	loginFormTmp.action = loginFormTmp.retPage.value;
	loginFormTmp.submit();
}
else if (document.head.innerText.indexOf("document.loginForm.submit()") != -1)
{
	console.log(document.loginForm);
	document.getElementsByName("loginForm")[0].submit();
}