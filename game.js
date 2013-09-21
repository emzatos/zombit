window.addEventListener('load', function(){init();}, false);

var targetFPS = 60;
var fps = targetFPS;
var lt = new Date().getTime(); //used for timing
var gameLevel = null; //currently loaded level

var tileWidth = 16; //pixel width of a tile
var tileHeight = 16;

var entities = []; //stores all entities
var items = []; //stores all items (does this need to exist?)

var gameScore = 0; //score...

//settings
var enableShaders = false; //this works, but it's probably too slow

//fps monitoring
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var fps = targetFPS;

particlesEnabled = true; //duh

uArgs = null; //user arguments

//utility function for efficient rendering w/ IE fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function init() {
	//create container to center canvas
	canvContainer = document.createElement("center");
	document.getElementById("cc").appendChild(canvContainer);

	//create canvas element
	canvas = document.createElement("canvas");
	canvas.width = screenWidth;
	canvas.height = screenHeight;
	canvas.style.cursor = "url('res/cursor.cur'), crosshair";
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

	//initialize advanced shader data
	oid = ctx.createImageData(viewWidth,viewHeight);
	dout = oid.data;
	for (var i=3; i<dout.length; i+=4) {dout[i] = 255;} //set to opaque
	
	//parse URL flags
	var loc = document.location.href;
	uArgs = loc.lastIndexOf("#")>loc.lastIndexOf("/")?loc.substring(loc.lastIndexOf("#")+1).split("&"):"";
	if (uArgs.indexOf("nointro")>=0) {dmode = GAME;}
	if (uArgs.indexOf("nomusic")<0) {/*setTimeout(startPlaylist,4900);*/}

	//initialize drawing buffers for lighting
	initLight();
	
	loadAudio(); //load audio
	addListeners(); //add input listeners

	mpMode = CLIENT; //this is not a sever.  this is for shared code

	//create player
	player = new Player(50,50,"Player");
	player.inv.push(new Pistol());
	player.inv.push(new AssaultRifle());
	player.inv.push(new Typhoon());
	player.inv.push(new Gauss());
	player.inv.push(new WoodenBat());
	player.inv.push(new GlowstickGun());
	player.inv.push(new RandomGunTester(0.9));

	startGame(); //generate and populate a level

	//set up some light
	var pLight = new EntityLight(player,"rgba(200,150,110,0.5)",200,1);
	pLight = new SpecialLightContainer(pLight);
	pLight.drawLight = function(dest,x,y,brightness,mode) {
		dest.save();
		dest.globalAlpha = brightness*mode==0?0.5:0;
		dest.translate(x,y);
		dest.rotate(player.facing-Math.PI);
		dest.translate(-(x+imgFlashlightBeam.width),-(y+imgFlashlightBeam.height/2));
		dest.drawImage(imgFlashlightBeam,x,y);
		dest.restore();
	}
	registerLight(pLight);

	//start music
	//setTimeout(startPlaylist,4900);

	//switch to game rendering mode in 5 sec
	setTimeout(function(){dmode=GAME;},5000);

	//start rendering
	requestAnimFrame(render);
	
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

var imgOverlay, imgEntityGeneric, imgPlayer;

//no idea why this exists
function tileImage(id) {
	return images[id];
}

//delta function.  use to make fps scalable
function d(s) {
	return s;  //LIES
	//return (60/fps)*s;
}

tdelta = 1;
window.performance = window.performance || {};
performance.now = (function() {
  return performance.now       ||
         performance.mozNow    ||
         performance.msNow     ||
         performance.oNow      ||
         performance.webkitNow ||
         function() { return Date.now(); };
})();
prevtime = performance.now();
function step() {
	time = performance.now();
	//console.log("d "+(time-prevtime));
	tdelta = (time-prevtime)/(1000/targetFPS);
	//console.log("e "+delta);

	//monitor framerate
	var thisFrameTime = (thisLoop=time) - lastLoop;
	frameTime+= (thisFrameTime - frameTime) / filterStrength;
	lastLoop = thisLoop;
	fps = (1000/frameTime).toFixed(1);
	
	processStep();

	// Switch sprites on key events (for player)
	/*if (keys[VK_LEFT]) {viewX-=3;}
	if (keys[VK_RIGHT]) {viewX+=3;}
	if (keys[VK_UP]) {viewY-=3;}
	if (keys[VK_DOWN]) {viewY+=3;}*/

	//clip viewport position
	if (viewX<0) {viewX = 0;}
	if (viewX>gameLevel.getWidth()*tileWidth-viewWidth) {viewX = gameLevel.getWidth()*tileWidth-viewWidth;}
	if (viewY<0) {viewY = 0;}
	if (viewY>gameLevel.getHeight()*tileHeight-viewHeight) {viewY = gameLevel.getHeight()*tileHeight-viewHeight;}

	//now called by animation frame
	//render();
	prevtime = time;
}

function godMode() {
	player.inv.getSelected().ammo = Infinity;
	player.inv.getSelected().clipsize = Infinity;
	player.life = Infinity;
}

function randomGun() {
	showPrompt("Enter awesomeness rating (0 to 1):", function(inpt){
		player.inv.inv[player.inv.selected] = new RandomGun(parseFloat(inpt));
	});
}