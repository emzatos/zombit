function addListeners() {
	document.addEventListener("keydown",kd,false);
	document.addEventListener("keyup",ku,false);
	canvas.addEventListener("mousemove",mm,false);
	canvas.addEventListener("mouseup",mu,false);
	canvas.addEventListener("mousedown",md,false);
	canvas.addEventListener("mousewheel",mw,false);

	//window.onresize = resizeCheck;
}

var keys = new Array(2048);
function kd(e) { //keydown
	if (modalsOpen<=0) {
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
		showPrompt("Enter nickname: ", function(serv){
			serv = serv!=""?serv:mpServer;

			showPrompt("Enter server IP or domain: ", function(port){ 
				port = port!=""?port:mpPort;

				showPrompt("Enter server port: ", function(nick) {
					nick = nick!=""?nick:mpNick;
					mpStart(nick,serv,port);
				})
			})
		});
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
}
function ku(e) { //keyup
	if (modalsOpen<=0) {
	if (!e) {e=event;}
	keys[e.keyCode] = false;

	if (mpActive) {mpSocket.emit("input",{type: INPUT_KB, code: e.keyCode, val: false});}
	}
}

mouseX = 0, mouseY = 0, mouseLeft = false;
scrolltotal=0;
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
	
	if (mpReady) {mpSocket.emit("input",{type: INPUT_MOUSE, btn: 1, state: true});}
}
function mu(e) {
	if (!e) {e=event;}
	e.preventDefault();
	mp(e);
	mouseLeft = false;
	
	if (mpReady) {mpSocket.emit("input",{type: INPUT_MOUSE, btn: 1, state: false});}
}
function mp(e) {
	var el = e.target;
	var posx = posy = 0;

	while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
		posx += el.offsetLeft - el.scrollLeft;
		posy += el.offsetTop - el.scrollTop;
		el = el.offsetParent;
	}

	posx = e.clientX - posx;
	posy = e.clientY - posy;

	var mcx = posx*(viewWidth/screenWidth);
	var mcy = posy*(viewHeight/screenHeight);
	mouseX = mcx;
	mouseY = mcy;
	
	//if (mpReady) {mpSocket.emit("input",{type: INPUT_MOUSE, x: mouseX, y: mouseY});}
	if (mpReady) {mpSocket.emit("input",{type: INPUT_MOUSE, facing: player.facing});}
}
function mw(e) {
	scrolltotal+=wheelDistance(e);
	//console.log(wheelDistance(e));
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

var modalsOpen = 0;
function makeModal(content,okcallback) {
	var modal = document.createElement("div");
	modal.className = "modal";
	modal.innerHTML = content;

	var okBtn = document.createElement("div");
	okBtn.className = "modalButton";
	okBtn.innerHTML = "OK";
	okBtn.onclick = okcallback;

	modal.appendChild(okBtn);
	document.body.appendChild(modal);
	modal.destroy = function(){document.body.removeChild(this); modalsOpen-=1;}

	modalsOpen+=1;

	return modal;
}

function showAlert(text,callback) {
	var modal = makeModal(text, function(){
		callback(true);
		modal.destroy();
	});
}

function showPrompt(text,callback) {
	var inpt = document.createElement("input");
	inpt.className = "modalInput";
	inpt.type = "text";

	var modal = makeModal(text+"<br>", function() {
		callback(inpt.value);
		modal.destroy();
	});
	modal.appendChild(inpt);

	inpt.focus();
}

/**
 * Creates the DatGUI
 * @returns {undefined}
 */
function createGUI() {
    //show the gui
	gui = new dat.GUI({autoPlace: false});
	gui.close();

	var customContainer = document.getElementById('datgui-container');
	customContainer.appendChild(gui.domElement);

	gui.remember(window);
	gui.remember(player);
	
	var display = gui.addFolder("Display");
	display.add(window, "viewWidth").min(0);
	display.add(window, "viewHeight").min(0);
	display.add(window, "screenWidth").min(0);
	display.add(window, "screenHeight").min(0);
	
	display.add(window, "showDebug");
	display.add(window, "enableShaders");
	display.add(window, "drawParticles");
	display.add(window, "drawOverlay");
	display.add(window, "tileShadows");
	display.add(window, "entityShadows");
	
	display.add(window, "enableLightRendering");
	display.add(window, "enableLightTinting");
	display.add(window, "enableGlare");
	
	display.add(window, "frameBlend").min(0).max(1).listen();
	display.add(window, "minFrameBlend").min(0).max(1);
	display.add(window, "defaultFrameBlend").min(0).max(1);
	
	display.add(window, "globalBrightness").min(0).max(2).step(0.1);
	
	var playr = gui.addFolder("Player");
	playr.add(player, "life").min(1).max(player.maxlife).step(1).listen();
	playr.add(player, "spdInc").step(0.01);
	playr.add(player, "maxSpd").step(0.01);
	playr.add(player, "friction").step(0.01);
	playr.add(window, "godMode");
	playr.add(window, "randomGun");
	
	var mpm = gui.addFolder("Multiplayer (Broken, do not use)");
	mpm.add(window, "mpServer");
	mpm.add(window, "mpPort");
	mpm.add(window, "mpNick");
	mpm.add(window, "mpStart");
	mpm.add(window, "mpConnect");
}