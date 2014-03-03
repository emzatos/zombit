BloodSplat = Particle.extend(function(x,y,xs,ys){
	this.x = x;
	this.y = y;
	this.xs = xs;
	this.ys = ys;
	this.life = 400;
	this.maxlife = this.life;
	try {this.image = [imgBloodSplat1,imgBloodSplat2,imgBloodSplat3][Math.floor(Math.random()*3)];}
	catch (e) {}

	this.type = BLOODSPLAT;
})
.methods ({

});
