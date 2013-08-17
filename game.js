var targetFPS = 60;
var fps = targetFPS;
var lt = new Date().getTime();
var gameLevel = null;

var tileWidth = 16;
var tileHeight = 16;

var entities = [];
var items = [];

var gameScore = 0;

//settings
var enableShaders = false; //this works, but it's probably too slow

//fps monitoring
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var fps = targetFPS;

particlesEnabled = true;

uArgs = null;

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
	canvas.style.cursor = "none";
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

	initLight();
	
	loadAudio();
	addListeners();
	startGame();
	
	//show the gui
	gui = new dat.GUI();
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

function tileImage(id) {
	return images[id];
}

function startGame() {
	mpMode = CLIENT;

	//generate gameLevel
	gameLevel = generateRectRooms(120,120,16);
	//gameLevel = generateNoise(120,120,[WALL,FLOOR]);
	gameLevel = generatePlants(gameLevel,0.1);
	gameLevel = punchOutWalls(gameLevel,0.1);
	
	addLightsToLevel(gameLevel,196,"rgb(215,191,182)",512,0.3,0.2);

	//create player
	player = new Player(50,50,"Player");
	player.inv.push(new Pistol());
	player.inv.push(new AssaultRifle());
	player.inv.push(new Typhoon());
	player.inv.push(new Gauss());
	player.inv.push(new WoodenBat());
	player.inv.push(new RandomGunTester(0.5));
	player.inv.push(new RandomGunTester(0.9));

	
	//spawn some zombies
	for (var i=0; i<15; i++) {
		var tx,ty,ta;
		do {
			tx = Math.round(Math.random()*(gameLevel.getWidth()-2))+1;
			ty = Math.round(Math.random()*(gameLevel.getHeight()-2))+1;
			ta = tileAt(tx,ty);
			if (ta!=null && ta.id==FLOOR) {break;}
		} while (true);
		new Zombie(tx*tileWidth+tileWidth/2, ty*tileHeight+tileHeight/2, 80);
	}

	//tell zombies to spawn continuously
	setInterval(function(){
		if (entities.length<50) {
		for (var i=0; i<1; i++) {
			var tx,ty,ta;
			do {
				tx = Math.round(Math.random()*(gameLevel.getWidth()-2))+1;
				ty = Math.round(Math.random()*(gameLevel.getHeight()-2))+1;
				ta = tileAt(tx,ty);
				if (ta!=null && ta.id==FLOOR) {break;}
			} while (true);
			new Zombie(tx*tileWidth+tileWidth/2, ty*tileHeight+tileHeight/2, 80);
		}}
	},500);

	//set up some light
	registerLight(new EntityLight(player,"rgba(200,150,110,0.5)",200));

	//start music
	//setTimeout(startPlaylist,4900);

	setTimeout(function(){dmode=GAME;},5000);

	//set interval for processing
	timer = setInterval(step,1000/targetFPS);
	
	//start rendering
	requestAnimFrame(render);
}

//delta function.  use to make fps scalable
function d(s) {
	return s;
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
	
	//process entities
	for (var ec in entities) {
		var ent = entities[ec];
		if (ent instanceof Entity) {ent.step(tdelta);}
	}

	//process particles
	for (var ec = 0; ec<particles.length; ec++) {
    	var prt = particles[ec];
		if (prt instanceof Particle) {prt.step(tdelta);}
	}

	/*if (mouseLeft) {
		var item = player.inv.getSelected();
		if (item instanceof Weapon) {
			item.fire();
		}
	}

	//inv selection keys
	for (var nk=49; nk<58; nk++) {
		if (keys[nk]) {player.inv.select(nk-49);}
	}

	//reload
	var rel = player.inv.getSelected().reload;
	if (keys[VK_R] && rel) {rel();}*/

	//process items (gun timers, etc)
	for (var ic = 0; ic<items.length; ic++) {
    	ite = items[ic];
		if (ite instanceof Item) {ite.step(tdelta);}
	}

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
	player.inv.inv[player.inv.selected] = new RandomGun(parseFloat(prompt("Enter awesomeness from 0 to 1.")));
}