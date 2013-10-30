targetFPS = 60;
gameLevel = null;
tileWidth = 16;
tileHeight = 16;
entities = new Array();
items = new Array();
player = null; //provide compatibility for some clientside code
mpSocket = null; //provide compatibility for some clientside code
particlesEnabled = false;

mpMode = SERVER;

//console.log("generation starting...");

preload();

startGame();

//console.log("def step...");

prevtime = Date.now();
//prevtime = microtime.now();
step = function() {
  time = Date.now();
  if (time-prevtime>16) {
	  tdelta = (time-prevtime-1)/(1000/targetFPS);
	  //time = microtime.now();
	  //var delta = (time-prevtime)/(1000000/targetFPS);
	  console.log("time: "+time+", delta: "+tdelta);

	  processStep(tdelta);

	  console.log("D "+(time-prevtime-1));
	  prevtime = time;
	}
	setImmediate(step);
}

d = function(i) {return i;} //compatibility

step();

//compatibility - nullify resources used by shared scripts to prevent node compile errors.
Discard = function() {
	this.src = null;
	this.play = function(){}
}
discard = new Discard();

// icons
pistolIcon = discard;
assultIcon = discard;
typhoonIcon = discard;
gaussIcon = discard;
batIcon = discard;
genericIcon = discard;

// Direction specific player images
imgPlayer_W = discard;
imgPlayer_A = discard;
imgPlayer_S = discard;
imgPlayer_D = discard;

// Entities
imgZombie = discard;
imgBullet = discard;
imgCursor = discard;
imgBloodSplat = discard;

images = new Array(4);
for (var i=0; i<images.length; i++) {images[i] = discard;}

imgOverlay = discard;
imgScreenBlood = discard;

sndGun1=discard;
sndGun2=discard;
sndGun3=discard;
sndTrack1=discard;
sndTrack2=discard;
sndTrack3=discard;
sndHit=discard;
sndDie=discard;
sndKill=discard;

//light sync coming soon... for now it's a compatibility shim:
registerLight = function(){}
unregisterLight = function(){}
StaticLight = function(){}
EntityLight = function(){}
SpecialLightContainer = function(){}
addLightsToLevel = function(){}