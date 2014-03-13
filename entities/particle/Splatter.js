Splatter = Particle.extend(function(x,y,xs,ys,ydrift,gravMult){
	this.x = x;
	this.y = y;
	this.ystart = y;
	this.xs = xs;
	this.ys = ys;
	this.ydrift = ydrift;
	this.life = 100;
	this.grav = 0.5*gravMult;
	this.maxlife = this.life;
	try {this.image = imgSplatter[~~(Math.random()*imgSplatter.length)];}
	catch (e) {this.destroy();}

	this.depth = -1;

	this.type = BLOODSPLAT;
})
.methods ({
	step: function(dlt) {
		this.ys+=this.grav;
		this.ys*=0.9;
		this.xs*=0.9;
		this.ydrift*=0.9;
		this.ystart+=this.ydrift;
		if (this.y-this.ystart>12) {this.ys=-this.ys*0.3;}
		this.supr();
	},
	render: function(x,y) {
		ctx.drawImage(this.image,x-this.image.width/2,y-this.image.height/2);
	}
});
