//images

// icons
var pistolIcon = new Image();
pistolIcon.src = "res/icon/pistol.png";
var assaultIcon = new Image();
assaultIcon.src = "res/icon/assault.png";
var typhoonIcon = new Image();
typhoonIcon.src = "res/icon/typhoon.png";
var gaussIcon = new Image();
gaussIcon.src = "res/icon/gauss.png";
var batIcon = new Image();
batIcon.src = "res/icon/bat.png";
var glowstickIcon = new Image();
glowstickIcon.src = "res/icon/glowstick.png";
var genericIcon = new Image();
genericIcon.src = "res/icon/generic.png";

// Direction specific player images
var imgPlayer_W = new Image();
imgPlayer_W.src = "res/entity/player/player_w.png";
var imgPlayer_A = new Image();
imgPlayer_A.src = "res/entity/player/player_a.png";
var imgPlayer_S = new Image();
imgPlayer_S.src = "res/entity/player/player_s.png";
var imgPlayer_D = new Image();
imgPlayer_D.src = "res/entity/player/player_d.png";

// Entities
var imgZombie = new Image();
imgZombie.src = "res/entity/zombie.png";
var imgBullet = new Image();
imgBullet.src = "res/entity/bullet.png";
var imgCursor = new Image();
imgCursor.src = "res/entity/cursor.png";
var imgBloodSplat1 = new Image();
imgBloodSplat1.src = "res/entity/bloodsplat2.png";
var imgBloodSplat2 = new Image();
imgBloodSplat2.src = "res/entity/bloodsplat3.png";
var imgBloodSplat3 = new Image();
imgBloodSplat3.src = "res/entity/bloodsplat4.png";
var imgShadow = new Image();
imgShadow.src = "res/entity/shadow.png";

var images = new Array(6);
for (var i=0; i<images.length; i++) {
	images[i] = new Image();
	images[i].src = "res/tile/"+i+".png";
}

var imgBorderLeft = new Image();
imgBorderLeft.src = "res/tile/border-left.png";
var imgBorderTop = new Image();
imgBorderTop.src = "res/tile/border-top.png";
var imgBorderRight = new Image();
imgBorderRight.src = "res/tile/border-right.png";
var imgBorderBottom = new Image();
imgBorderBottom.src = "res/tile/border-bottom.png";
var imgBlockShadow = new Image();
imgBlockShadow.src = "res/tile/shadow.png";

var imgOverlay = new Image();
imgOverlay.src = "res/overlay.png";
var imgScreenBlood = new Image();
imgScreenBlood.src = "res/screenblood.png";
var imgGlare = new Image();
imgGlare.src = "res/glare5.png";
var imgFlashlightBeam = new Image();
imgFlashlightBeam.src = "res/flashlight.png";

var imgSplatter = [];
for (var i=0; i<5; i++) {
	imgSplatter[i] = new Image();
	imgSplatter[i].src = "res/splatter"+i+".png";
}