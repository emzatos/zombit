function tileAt(ex, ey) {
	var bx = Math.floor(ex/tileWidth);
	var by = Math.floor(ey/tileHeight);
	if (bx>0 && by>0 && bx<gameLevel.getWidth() && by<gameLevel.getHeight()) {
		return gameLevel.getTile(bx,by);
	}
	else {return null;}
}

function pDir(x1,y1,x2,y2) {
	return Math.atan2((y2-y1),(x2-x1));
}

function pDist(x1,y1,x2,y2) {
	var xd = x2-x1;
	var yd = y2-y1;
	return Math.sqrt(xd*xd+yd*yd);
}

function lDirX(len,dir) {
	return Math.cos(dir)*len;
}

function lDirY(len,dir) {
	return Math.sin(dir)*len;
}

function radians(deg) {
	return deg*0.01745;
}

function degrees(rad) {
	return rad*57.29577;
}

var Entity = klass(function (x,y) {
	this.x = x||50;
	this.y = y||50;
	this.xs = 0;
	this.ys = 0;
	this.life = 100;

	this.image = imgEntityGeneric;
	this.width = tileWidth;
	this.height = tileHeight;

	//entity management code
	this.arrIndex = entities.push(this)-1;
})
.methods({
	step: function() {
		var sx = Math.abs(d(this.xs));
		var sy = Math.abs(d(this.ys));

		//move for xspeed
		var xm = this.xs>0?1:-1;
		for (var xx=0; xx<sx; xx++) {
			var ctile = tileAt(this.x+xm+(xm*this.width*0.5),this.y);
			if (ctile!=null && ctile.id==FLOOR) {
				this.x+=xm;
			}
			else {
				this.collide(ctile);
				this.xs=0;
				break;
			}
		}
		if (tileAt(this.x+(this.xs%1)+(xm*this.width*0.5),this.y)) {this.x+=(this.xs%1);}

		//move for yspeed
		var ym = this.ys>0?1:-1;
		for (var yy=0; yy<sy; yy++) {
			var ctile = tileAt(this.x,this.y+ym+(ym*this.height*0.5));
			if (ctile!=null && ctile.id==FLOOR) {
				this.y+=ym;
			}
			else {
				this.collide(ctile);
				this.ys=0;
				break;
			}
		}
		if (tileAt(this.y,this.y+(this.ys%1)+(ym*this.height*0.5))) {this.y+=(this.ys%1);}
		
		//deprecated
		/*this.x+=d(this.xs);
		this.y+=d(this.ys);*/
	},
	damage: function(amount) {
		this.life-=amount;
		if (this.life<=0) {this.die();}
	},
	die: function() {
		this.destroy();
	},
	collide: function(tile) {
		//override with collision logic
	},
	render: function(x,y) {
		ctx.drawImage(this.image,x-tileWidth/2,y-tileHeight/2,tileWidth,tileHeight);
	},
	destroy: function() {
		entities.splice(this.arrIndex,1);
		//shift index of other items
		for (var i=this.arrIndex; i<entities.length; i++) {
			entities[i].arrIndex-=1;
		}
	}
})

var Player = Entity.extend(function(x,y,name){
	this.name = name;
	this.image = imgPlayer;
	this.spdInc = 0.5;
	this.inv = new Inventory(5);
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

		//clip view pos
		if (viewX<0) {viewX=0;}
		if (viewX>gameLevel.getWidth()*tileWidth-viewWidth) {viewX = gameLevel.getWidth()*tileWidth-viewWidth;}
		if (viewY<0) {viewY=0;}
		if (viewY>gameLevel.getHeight()*tileHeight-viewHeight) {viewY = gameLevel.getHeight()*tileHeight-viewHeight;}
	},
	die: function() {

	},
	control: function() {
		//accept keyboard input
		if (keys[VK_A]) {this.xs-=d(this.spdInc);}
		if (keys[VK_D]) {this.xs+=d(this.spdInc);}
		if (keys[VK_W]) {this.ys-=d(this.spdInc);}
		if (keys[VK_S]) {this.ys+=d(this.spdInc);}
	}
});

var T_SEARCH=0;
var Hostile = Entity.extend(function(x,y,vr){
	this.target = T_SEARCH;
	this.visionRadius = vr||50;
	this.spd = 1;
})
.methods({
	step: function() {
		this.supr();

		if (this.target==T_SEARCH) { //need to find a target (the player for now)
			if (pDist(this.x,this.y,player.x,player.y)<this.visionRadius) { //see if in range
				this.target = player;
			}
		}
		else {
			if (pDist(this.x,this.y,this.target.x,this.target.y)>this.visionRadius*2) { //see if too far to follow
				this.target = T_SEARCH; //reset target
			}
			else { //target is close enough to follow
				//calculate direction to target and move toward it at constant speed
				var pd = pDir(this.x,this.y,this.target.x,this.target.y);
				this.xs = lDirX(this.spd,pd);
				this.ys = lDirY(this.spd,pd);
			}
		}
	}
});

var Zombie = Hostile.extend(function(x,y,vr){
	this.image = imgZombie;
	this.spd=0.3;
	this.visionRadius = 80;
})
.methods({
	step: function() {
		this.supr();

		//randumbly wander if no target
		if (this.target==T_SEARCH && Math.random()<0.01) {
			this.xs = -1+Math.random()*2;
			this.ys = -1+Math.random()*2;
		}
	}
});

var Projectile = Entity.extend(function(x,y,sender){
	this.sender = sender||null;
	this.width = 4;
	this.height = 4;
})
.methods({
	step: function() {
		this.supr();

		//check for entity collisions
		var x1=this.x,y1=this.y,x2=this.x+this.xs,y2=this.y+this.ys;

		var deres = 1;
	    var dX,dY,iSteps;
	    var xInc,yInc,iCount,x,y;

	    dX = x1 - x2;
	    dY = y1 - y2;

	    if (Math.abs(dX) > Math.abs(dY))
	    {
	        iSteps = Math.abs(dX);
	    }
	    else
	    {
	        iSteps = Math.abs(dY);
	    }

	    xInc = dX/iSteps;
	    yInc = dY/iSteps;

	    x = x1;
	    y = y1;

	    var breakloop = false;
	    for (iCount=1; iCount<=iSteps; iCount+=deres)
	    {
	    	for (var ec = 0; ec<entities.length; ec++) {
		    	ent = entities[ec];
				if (ent instanceof Entity) {
					if (ent!=this.sender && ent!=this && !(ent instanceof Projectile) && pDist(ent.x,ent.y,this.x,this.y)<=ent.width*0.5) {
						this.collide(ent);
						breakloop = true;
						break;
					}
				}
			}

			if (breakloop) {break;}

	        x -= xInc;
	        y -= yInc;
	    }
	}
});

var Bullet = Projectile.extend(function(x,y,damage,sender){
	this.damage = damage||20;
	this.xp=null;
	this.yp=null;
	this.image = imgBullet;
	this.sender = sender;
})
.methods({
	step: function() {
		this.supr();
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
		if (this.xp!=null) {
		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.moveTo(this.xp,this.yp);
		ctx.lineTo(x,y);
		ctx.stroke();
		}
		this.xp=x;
		this.yp=y;
	}
})