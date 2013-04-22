targetFPS = 60;
fps = targetFPS;
lt = new Date().getTime();
level = null;

tileWidth = 16;
tileHeight = 16;

function init() {
	//create container to center canvas
	canvContainer = document.createElement("center");
	document.body.appendChild(canvContainer);

	//create canvas element
	canvas = document.createElement("canvas");
	canvas.width = screenWidth;
	canvas.height = screenHeight;
	canvContainer.appendChild(canvas);
	sctx = canvas.getContext("2d"); //screen context, shouldn't be draw onto usually

	//create invisible "buffer" canvas
	buffer = document.createElement("canvas");
	buffer.width = viewWidth;
	buffer.height = viewHeight;
	ctx = buffer.getContext("2d"); //buffer context

	//suggest to browsers not to antialias
	ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;	
	sctx.webkitImageSmoothingEnabled = false;
	sctx.mozImageSmoothingEnabled = false;
	sctx.imageSmoothingEnabled = false;	

	//clear buffer to black
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,viewWidth,viewHeight);

	addListeners();
	startGame();
}

function startGame() {
	//generate level
	level = generateEmptyRoom(40,40);

	//set interval for processing
	timer = setInterval(step,1000/targetFPS);
}

function step() {
	fps = 1000/((new Date().getTime())-lt);
	lt = new Date().getTime();

	//move view with arrow keys
	if (keys[VK_LEFT]) {viewX-=3;}
	if (keys[VK_RIGHT]) {viewX+=3;}
	if (keys[VK_UP]) {viewY-=3;}
	if (keys[VK_DOWN]) {viewY+=3;}

	//clip viewport position
	if (viewX<0) {viewX = 0;}
	if (viewX>level.getWidth()*tileWidth-viewWidth) {viewX = level.getWidth()*tileWidth-viewWidth;}
	if (viewY<0) {viewY = 0;}
	if (viewY>level.getHeight()*tileHeight-viewHeight) {viewY = level.getHeight()*tileHeight-viewHeight;}

	render();
}

//store random numbers for very fast random number generation (for shaders, etc.)
frandArray = new Array(20000);
for (var i=0; i<frandArray.length; i++) {frandArray[i] = Math.random();}
frandPtr = 0;
function frand() {
	frandPtr=frandPtr==frandArray.length-1?0:frandPtr+1;
	return frandArray[frandPtr];
}