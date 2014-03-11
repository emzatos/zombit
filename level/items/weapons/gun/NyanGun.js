NyanGun = Gun.extend(function(){
	this.name = "Nyan Gun";
	this.clipsize = 500;
	this.ammo = this.clipsize;
	this.delay = 1;
	this.damage = 100;
	this.spread = 19;
	this.spd = 40;
	this.friction = 0.12;
	this.snd = sndGun3;

	this.colIndex = 0;
	this.type = NYANGUN;
})
.methods({
	bullet: function() { //for now, we must override this to set bullet color
		if (this.snd) {this.snd.play();}

		this.colIndex+=10;
		if (this.colIndex>=359) {this.colIndex = 0;}

		var c1 = "hsla(" + this.colIndex + ", 60%, 60%, 1)";
		var c2 = "hsla(" + this.colIndex + ", 40%, 40%, 0)";

		//vector converted to xspeed/yspeed
		var user = getEntityReference(user);
		var dir = user.facing+radians(grand()*this.spread-this.spread*0.5);
		var xs = lDirX(this.spd,dir);
		var ys = lDirY(this.spd,dir);

		//create bullet and set speeds
		var blt = new Bullet(user.x,user.y,this.damage,user);
		blt.xs = xs;
		blt.ys = ys;
		blt.friction = this.friction*(0.8+grand(0.4));

		blt.col1 = c1;
		blt.col2 = c2;
		return blt;
	}
});