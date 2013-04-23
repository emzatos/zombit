var Entity = klass(function (x,y) {
	this.x = x||50;
	this.y = y||50;
	this.xs = 0;
	this.ys = 0;
	this.life = 100;

	this.image = imgEntityGeneric;

	//entity management code
	this.arrIndex = entities.push(this);
})
.methods({
	step: function() {
		this.x+=d(this.xs);
		this.y+=d(this.ys);
	},
	render: function(x,y) {
		ctx.drawImage(this.image,x-tileWidth/2,y-tileHeight/2,tileWidth,tileHeight);
	},
	destroy: function() {
		entities.splice(this.arrIndex,1);
	}
})

var Player = Entity.extend(function(x,y,name){
	this.name = name;
	this.image = imgPlayer;
})
.methods({
	step: function() {
		this.supr();
		this.xs*=0.8;
		this.ys*=0.8;

		this.control();

		//clip speed
		if (this.xs>5) {this.xs=5;}
		if (this.xs<-5) {this.xs=-5;}
		if (this.ys>5) {this.ys=5;}
		if (this.ys<-5) {this.ys=-5;}

		//move view to player
		viewX = ~~(this.x-viewWidth/2);
		viewY = ~~(this.y-viewHeight/2);
	},
	control: function() {
		//accept keyboard input
		if (keys[VK_LEFT]) {this.xs-=d(1);}
		if (keys[VK_RIGHT]) {this.xs+=d(1);}
		if (keys[VK_UP]) {this.ys-=d(1);}
		if (keys[VK_DOWN]) {this.ys+=d(1);}
	}
});