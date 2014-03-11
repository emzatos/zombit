Pistol = Gun.extend(function(){
	this.name = "Pistol";
	this.clipsize = 20;
	this.ammo = 20;
	this.delay = 9;
	this.damage = 10;
	this.spread = 7;
	this.spd=19;
	this.snd = sndGun2;
	try{this.icon = pistolIcon;}catch(e){}
	this.type = PISTOL;
})
.methods({

});