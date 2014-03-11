Typhoon = Gun.extend(function(){
	this.name = "Typhoon";
	this.clipsize = 200;
	this.ammo = this.clipsize;
	this.delay = 2;
	this.damage = 4;
	this.spread = 19;
	this.spd = 22;
	this.friction = 0.07;
	this.snd = sndGun3;
	try{this.icon = typhoonIcon;}catch(e){}
	this.type = TYPHOON;
})
.methods({
});