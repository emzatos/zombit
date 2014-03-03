Bullet = Projectile.extend(function(x,y,damage,sender){
	this.damage = damage||20;
	this.xp=null;
	this.yp=null;
	try{this.image = imgBullet;}
	catch (e) {}
	this.sender = makeEntityReference(sender);
	
	this.col1 = "255,205,0";
	this.col2 = "220,170,0";
	
	this.light = null;
	this.light2 = null;

	this.type = BULLET;
	
	this.emitConstruct();
})
.methods({
	step: function(dlt) {
		this.supr(dlt);
		if (Math.abs(this.xs)+Math.abs(this.ys)<3) {this.destroy();}
	},
	collide: function(thing) {
		if (thing instanceof Entity) {
			//thing.damage(this.damage);
				thing.damage(this.damage);
			//console.log("damaged ent! new health "+thing.life);
			//this.destroy();
		}
		this.destroy();
	},
	render: function(x,y) {
		if (this.light==null) {
			this.light = new EntityLight(this,"rgba("+this.col1+",1)",40,0.7);
			registerLight(this.light);

			this.light2 = new EntityLight(this,"rgba("+this.col1+",1)",120,0.2);
			registerLight(this.light2);
		}
	
		if (this.xp!=null) {
		/*var grad= ctx.createLinearGradient(x, y, this.xp, this.yp);
		grad.addColorStop(0, "rgba(255,255,255,1)");
		grad.addColorStop(1, "rgba(255,255,255,0.5)");*/

		var grad0= ctx.createLinearGradient(x, y, this.xp, this.yp);
		grad0.addColorStop(0, "rgba(255,255,255,1)");
		grad0.addColorStop(1, "rgba(255,255,255,0.6)");
		
		var grad1= ctx.createLinearGradient(x, y, this.xp, this.yp);
		grad1.addColorStop(0, "rgba("+this.col1+",1)");
		grad1.addColorStop(0.75, "rgba("+this.col2+",0)");
		
		ctx.lineCap = "round";

		ctx.lineWidth = 4;
		ctx.strokeStyle = grad1;
		ctx.beginPath();
		ctx.moveTo(this.xp,this.yp);
		ctx.lineTo(x,y);
		ctx.stroke();

		ctx.lineWidth = 1;
		ctx.strokeStyle = grad0;
		ctx.beginPath();
		ctx.moveTo(this.xp,this.yp);
		ctx.lineTo(x,y);
		ctx.stroke();
		}
		this.xp=x;
		this.yp=y;
	},
	destroy: function() {
		unregisterLight(this.light);
		unregisterLight(this.light2);
		this.supr();
	}
});
