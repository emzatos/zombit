AssaultRifle = Gun.extend(function(){
	this.name = "Assault Rifle";
	this.clipsize = 35;
	this.ammo = this.clipsize;
	this.delay = 4;
	this.damage = 15;
	this.spread = 3;
	this.spd = 24;
	this.snd = sndGun1;
	try{this.icon = assaultIcon;}catch(e){}
	this.type = ASSAULTRIFLE;
})
.methods({
});