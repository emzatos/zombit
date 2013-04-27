function addListeners() {
	document.addEventListener("keydown",kd,false);
	document.addEventListener("keyup",ku,false);
	canvas.addEventListener("mousemove",mm,false);
	canvas.addEventListener("mouseup",mu,false);
	canvas.addEventListener("mousedown",md,false);
}

VK_LEFT = 37, VK_UP=38, VK_RIGHT=39, VK_DOWN=40, VK_W=87, VK_A=65, VK_S=83, VK_D=68, VK_R=82;
VK_0 = 48, VK_1 = 49, VK_2 = 50, VK_3 = 51, VK_4 = 52, VK_5 = 53, VK_6 = 54, VK_7 = 55, VK_8 = 56, VK_9 = 57; 
var keys = new Array(2048);
function kd(e) { //keydown
	if (!e) {e=event;}
	keys[e.keyCode] = true;
}
function ku(e) { //keyup
	if (!e) {e=event;}
	keys[e.keyCode] = false;
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
}
function mu(e) {
	if (!e) {e=event;}
	e.preventDefault();
	mp(e);
	mouseLeft = false;
}
function mp(e) {
	mouseX = e.layerX||e.pageY-canvas.offsetLeft;
	mouseY = e.layerY||e.pageX-canvas.offsetTop;
	var mcx = mouseX*(viewWidth/screenWidth);
	var mcy = mouseY*(viewHeight/screenHeight);
	mouseX = mcx;
	mouseY = mcy;
}