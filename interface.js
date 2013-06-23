function addListeners() {
	document.addEventListener("keydown",kd,false);
	document.addEventListener("keyup",ku,false);
	canvas.addEventListener("mousemove",mm,false);
	canvas.addEventListener("mouseup",mu,false);
	canvas.addEventListener("mousedown",md,false);

	//window.onresize = resizeCheck;
}

VK_LEFT = 37, VK_UP=38, VK_RIGHT=39, VK_DOWN=40, VK_W=87, VK_A=65, VK_S=83, VK_D=68, VK_R=82, VK_T=84;
VK_0 = 48, VK_1 = 49, VK_2 = 50, VK_3 = 51, VK_4 = 52, VK_5 = 53, VK_6 = 54, VK_7 = 55, VK_8 = 56, VK_9 = 57; 
VK_F10 = 121, VK_F11 = 122, VK_ESCAPE=27, VK_ENTER=13, VK_BACKSPACE=8;
var keys = new Array(2048);
function kd(e) { //keydown
	if (!e) {e=event;}
	if (e.keyCode==VK_F11) {
		if (!window.screenTop && !window.screenLeft) {
			fullscreen(true);
		}
		else {
			fullscreen(false);
		}
	}
	if (e.keyCode==VK_F10) {
		var nick = prompt("Enter nickname: ");
		var serv = prompt("Enter server IP or domain: ");
		var port = prompt("Enter server port: ");
		serv = serv!=""?serv:mpServer;
		port = port!=""?port:mpPort;
		nick = nick!=""?nick:mpNick;
		mpStart(nick,serv,port);
	}
	if (e.keyCode==VK_T && !mpChatOpen) {
		mpChatOpen = true;
		mpChatInput = document.createElement("input");
		mpChatInput.type = "text";
		mpChatInput.style.position = "absolute";
		mpChatInput.style.left = "-100px";
		mpChatInput.style.top = "-100px";
		document.body.appendChild(mpChatInput);
		mpChatInput.addEventListener("input",function() {
			mpTypedChat = mpChatInput.value;
		},false);
		/*mpChatInput.addEventListener("blur",function(){
			mpChatOpen = false;
			document.body.removeChild(mpChatInput);
		},false);*/
		mpChatInput.focus();
		e.preventDefault();
	}
	else if (e.keyCode==VK_ESCAPE && mpChatOpen) {
		try {
			mpChatOpen = false;
			document.body.removeChild(mpChatInput);
		} catch (e) {}
	}
	else if (e.keyCode==VK_ENTER && mpChatOpen) {
		mpSendChat();
		try {
			mpChatOpen = false;
			document.body.removeChild(mpChatInput);
		} catch (e) {}
		
	}
	if (!mpChatOpen) {
		keys[e.keyCode] = true;

		//send input to server
		if (mpReady) {mpSocket.emit("input",{type: INPUT_KB, code: e.keyCode, val: true});}
	}
}
function ku(e) { //keyup
	if (!e) {e=event;}
	keys[e.keyCode] = false;

	if (mpActive) {mpSocket.emit("input",{type: INPUT_KB, code: e.keyCode, val: false});}
}

mouseX = 0, mouseY = 0, mouseLeft = false;
function mm(e) {
	if (!e) {e=event;}
	mp(e);
}
function md(e) {
	if (!e) {e=event;}
	e.preventDefault();
	mp(e);
	mouseLeft = true;

	if (mpChatOpen) {
		mpChatOpen = false;
		document.body.removeChild(mpChatInput);
	}
}
function mu(e) {
	if (!e) {e=event;}
	e.preventDefault();
	mp(e);
	mouseLeft = false;
}
function mp(e) {
	var posx = 0;
	var posy = 0;

	if (e.pageX || e.pageY) 	{
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	{
		posx = e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}

	var mcx = (posx-canvas.offsetLeft)*(viewWidth/screenWidth);
	var mcy = (posy-canvas.offsetTop)*(viewHeight/screenHeight);
	mouseX = mcx;
	mouseY = mcy;
}

function fullscreen(on) {
	if (on) { //if fullscreen
		canvas.style.position = "absolute";
		canvas.style.left = "0px";
		canvas.style.top = "0px";
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
		sctx.webkitImageSmoothingEnabled = false;
		sctx.mozImageSmoothingEnabled = false;
		sctx.imageSmoothingEnabled = false;	
	}
	else {
		canvas.style.position = "relative";
		canvas.width = defaultScreenWidth;
		canvas.height = defaultScreenHeight;
		screenWidth = defaultScreenWidth;
		screenHeight = defaultScreenHeight;
		sctx.webkitImageSmoothingEnabled = false;
		sctx.mozImageSmoothingEnabled = false;
		sctx.imageSmoothingEnabled = false;	
	}
}