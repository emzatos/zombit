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

//generate gameLevel
gameLevel = generateRectRooms(50,50,16);
//gameLevel = generateNoise(120,120,[WALL,FLOOR]);
gameLevel = generatePlants(gameLevel,0.1);
gameLevel = punchOutWalls(gameLevel,0.1);

//console.log("def step...");

step = function() {
	//process entities
	for (var ec = 0; ec<entities.length; ec++) {
    	var ent = entities[ec];
		if (ent instanceof Entity) {ent.step();}
	}

	//process items (gun timers, etc)
	for (var ic = 0; ic<items.length; ic++) {
    	ite = items[ic];
		if (ite instanceof Item) {ite.step();}
	}
}

d = function(i) {return i;} //compatibility

//console.log("spawning...");

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

//console.log("setting interval...");

//tell zombies to spawn continuously
/*setInterval(function(){
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
},10);*/

timer = setInterval(step,1000/targetFPS);

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