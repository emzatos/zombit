function tileAt(ex, ey) {
	var bx = Math.floor(ex/tileWidth);
	var by = Math.floor(ey/tileHeight);
	if (bx>0 && by>0 && bx<gameLevel.getWidth() && by<gameLevel.getHeight()) {
		return gameLevel.getTile(bx,by);
	}
	else {return null;}
}

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
		var sx = Math.abs(d(this.xs));
		var sy = Math.abs(d(this.ys));

		//move for xspeed
		for (var xx=0; xx<sx; xx++) {
			var xm = this.xs>0?1:-1;
			var ctile = tileAt(this.x+xm+(xm*tileWidth*0.5),this.y);
			if (ctile!=null && ctile.id==FLOOR) {
				this.x+=xm;
			}
			else {
				this.xs=0;
				break;
			}
		}

		//move for yspeed
		for (var yy=0; yy<sy; yy++) {
			var ym = this.ys>0?1:-1;
			var ctile = tileAt(this.x,this.y+ym+(ym*tileHeight*0.5));
			if (ctile!=null && ctile.id==FLOOR) {
				this.y+=ym;
			}
			else {
				this.ys=0;
				break;
			}
		}
		
		//deprecated
		/*this.x+=d(this.xs);
		this.y+=d(this.ys);*/
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
	this.spdInc = 0.5;
})
.methods({
	step: function() {
		this.supr();
		this.xs*=0.8;
		this.ys*=0.8;
		if (Math.abs(this.xs)<0.1) {this.xs = 0;}
		if (Math.abs(this.ys)<0.1) {this.ys = 0;}

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
		if (keys[VK_LEFT]) {this.xs-=d(this.spdInc);}
		if (keys[VK_RIGHT]) {this.xs+=d(this.spdInc);}
		if (keys[VK_UP]) {this.ys-=d(this.spdInc);}
		if (keys[VK_DOWN]) {this.ys+=d(this.spdInc);}
	}
});