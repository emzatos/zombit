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

VK_LEFT = 37, VK_UP=38, VK_RIGHT=39, VK_DOWN=40, VK_W=87, VK_A=65, VK_S=83, VK_D=68, VK_R=82, VK_T=84;
VK_0 = 48, VK_1 = 49, VK_2 = 50, VK_3 = 51, VK_4 = 52, VK_5 = 53, VK_6 = 54, VK_7 = 55, VK_8 = 56, VK_9 = 57; 
VK_F10 = 121, VK_F11 = 122, VK_ESCAPE=27, VK_ENTER=13, VK_BACKSPACE=8;



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