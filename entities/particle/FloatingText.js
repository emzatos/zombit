FloatingText = Particle.extend(function(text,color,x,y,maxlife) {
	this.text = text;
	this.col = color;
	this.x = x;
	this.y = y;
	this.maxlife = maxlife;
	this.life = maxlife;

	this.friction = 0;
	this.width = 0;
	this.height = 0;

	this.type = PARTICLE;
})
.methods({
	step: function(dlt) {
		this.supr(dlt);
		this.life-=1;
	},
	render: function(x,y) {
		ctx.fillStyle = "rgba(0,0,0,"+(this.life/this.maxlife)+")";
		ctx.fillText(this.text,x+1,y+1);
		ctx.fillStyle = "rgba("+this.col+","+(this.life/this.maxlife)+")";
		ctx.fillText(this.text,x,y);
	},
	die: function() {
		this.destroy();
	}
});
