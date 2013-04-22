var targetFPS = 100;
var fps = targetFPS;
var lt = new Date().getTime();
var gameLevel = null;

var tileWidth = 16;
var tileHeight = 16;

//fps monitoring
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var fps = targetFPS;

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

	loadResources();
	addListeners();
	startGame();
}

function loadResources() {
	// add the tile images into an array
	images = new Array();
	// IMAGES MUST BE LOADED!!!
	images = ["1.png", "2.png", "3.png", "4.png"];
	// load the tile images
	for(var i=0; i<images.length; i++) {
		console.log("loading image: "+images[i]);
		var ii = new Image();
		// load images from res
		ii.src = "res/tile/"+images[i];
		images[i] = ii;
	}

	//load overlay
	imgOverlay = new Image();
	imgOverlay.src = "res/overlay.png";
}

function tileImage(id) {
	return images[id];
}

function startGame() {
	//generate gameLevel
	gameLevel = generateRectRooms(60,60,12);
	gameLevel = generatePlants(gameLevel,0.8);

	//set interval for processing
	timer = setInterval(step,1000/targetFPS);
}

function step() {
	var thisFrameTime = (thisLoop=new Date) - lastLoop;
	frameTime+= (thisFrameTime - frameTime) / filterStrength;
	lastLoop = thisLoop;
	fps = (1000/frameTime).toFixed(1);

	//move view with arrow keys
	if (keys[VK_LEFT]) {viewX-=3;}
	if (keys[VK_RIGHT]) {viewX+=3;}
	if (keys[VK_UP]) {viewY-=3;}
	if (keys[VK_DOWN]) {viewY+=3;}

	//clip viewport position
	if (viewX<0) {viewX = 0;}
	if (viewX>gameLevel.getWidth()*tileWidth-viewWidth) {viewX = gameLevel.getWidth()*tileWidth-viewWidth;}
	if (viewY<0) {viewY = 0;}
	if (viewY>gameLevel.getHeight()*tileHeight-viewHeight) {viewY = gameLevel.getHeight()*tileHeight-viewHeight;}

	render();
}

//util
function irand(max) {
	if (max) {return Math.round(Math.random()*max);}
	else {return Math.round(Math.random());}
}

//store random numbers for very fast random number generation (for shaders, etc.)
frandArray = new Array(20000);
for (var i=0; i<frandArray.length; i++) {frandArray[i] = Math.random();}
frandPtr = 0;
function frand() {
	frandPtr=frandPtr==frandArray.length-1?0:frandPtr+1;
	return frandArray[frandPtr];
}
function ifrand(max) {
	if (max) {return ~~(frand()*max);}
	else {return ~~(frand());}
}