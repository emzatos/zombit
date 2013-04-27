function tileAt(ex, ey) {
	var bx = Math.floor(ex/tileWidth);
	var by = Math.floor(ey/tileHeight);
	if (bx>0 && by>0 && bx<gameLevel.getWidth() && by<gameLevel.getHeight()) {
		return gameLevel.getTile(bx,by);
	}
	else {return null;}
}

function pDir(x1,y1,x2,y2) {
	var xd = x2-x1;
	var yd = y2-y1;

	return Math.atan2(yd,xd);
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

function collisionLine(circleX,circleY,radius,lineX1,lineY1,lineX2,lineY2,returnPoints) {
	//modified from: http://stackoverflow.com/questions/1073336/circle-line-collision-detection
	var dlineX2lineX1 = (lineX2-lineX1);
	var dlineY2lineY1 = (lineY2-lineY1);
	var LAB = Math.sqrt( dlineX2lineX1*dlineX2lineX1+dlineY2lineY1*dlineY2lineY1 );

	var Dx = (lineX2-lineX1)/LAB;
	var Dy = (lineY2-lineY1)/LAB;

	var t = Dx*(circleX-lineX1) + Dy*(circleY-lineY1);

	var Ex = t*Dx+lineX1;
	var Ey = t*Dy+lineY1;

	//check to see if Ex is on the line
	if ((lineX2>lineX1 && Ex>=lineX1 && Ex<=lineX2) || (lineX2<lineX1 && Ex>=lineX2 && Ex<=lineX1)) {
		if ((lineY2>lineY1 && Ey>=lineY1 && Ey<=lineY2) || (lineY2<lineY1 && Ey>=lineY2 && Ey<=lineY1)) {
			//on segment
		}
		else {return returnPoints?-1:false;}
	}
	else {return returnPoints?-1:false;}

	var dEycircleY = (Ey-circleY);
	var LEC = Math.sqrt( (Ex-circleX)+dEycircleY*dEycircleY );

	if( LEC < radius ) {
		if (returnPoints) {
		    var dt = Math.sqrt( radius*radius - LEC*LEC);

		    var Fx = (t-dt)*Dx + lineX1;
		    var Fy = (t-dt)*Dy + lineY1;

		    var Gx = (t+dt)*Dx + lineX1;
		    var Gy = (t+dt)*Dy + lineY1;

		    return [Fx,Fy,Gx,Gy];
		}
		else {return true;}
	}

	else if( LEC == radius ) {
		return returnPoints?1:true;
	}

	else {
		return returnPoints?-1:false;
	}
}

var Entity = klass(function (x,y) {
	this.x = x||50;
	this.y = y||50;
	this.xs = 0;
	this.ys = 0;
	this.friction = 0;
	this.life = 100;

	this.facing = null;

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

		//apply friction
		this.xs*=1-this.friction;
		this.ys*=1-this.friction;
		
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
	this.inv = new Inventory(5,this);
	this.friction = 0.2;
	this.facing = 0;
})
.methods({
	step: function() {
		this.supr();
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

		//point player toward mouse
		//player position corrected for view
		var pcx = player.x-viewX;
		var pcy = player.y-viewY;
		//console.log(pcx+","+pcy)

		//direction from corrected position to mouse
		var dir = pDir(pcx,pcy,mouseX,mouseY);
		player.facing = dir;
	},
	die: function() {
		this.life = 100;
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
	this.facing = 0;
	this.inv = new Inventory(1,this);
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
			var targetDist = pDist(this.x,this.y,this.target.x,this.target.y);
			var targetDir = pDir(this.x,this.y,this.target.x,this.target.y);
			this.facing = targetDir;

			if (targetDist>this.visionRadius*2) { //see if too far to follow
				this.target = T_SEARCH; //reset target
			}
			else { //target is close enough to follow
				//calculate direction to target and move toward it at constant speed
				var pd = targetDir;
				this.xs = lDirX(this.spd,pd);
				this.ys = lDirY(this.spd,pd);
			}

			var invSelected = this.inv.getSelected();
			if (invSelected instanceof Weapon) {
				if (targetDist<invSelected.range) {
					this.attack(this.target);
				}
			}
		}
	},

	attack: function(entity) {
		this.inv.getSelected().fire();
		//can be overriden to provide custom attack behavior
	}
});

var Zombie = Hostile.extend(function(x,y,vr){
	this.image = imgZombie;
	this.spd=0.3;
	this.visionRadius = 80;
	this.inv.push(new ZombieAttack());
})
.methods({
	step: function() {
		this.supr();

		if (this.target==T_SEARCH) {
			//randumbly wander if no target
			if (Math.random()<0.01) {
				this.xs = -1+Math.random()*2;
				this.ys = -1+Math.random()*2;
			}
		}
	}
});

var Projectile = Entity.extend(function(x,y,sender){
	this.sender = sender||null;
	this.width = 1;
	this.height = 1;
	this.friction = 0;
})
.methods({
	step: function() {
		this.supr();

		//check for entity collisions
		var x1=this.x-this.xs;
		var y1=this.y-this.ys;
		var x2=this.x;
		var y2=this.y;

    	for (var ec = 0; ec<entities.length; ec++) {
	    	ent = entities[ec];
			if (ent instanceof Entity) {
				if (ent!=this.sender && ent!=this && !(ent instanceof Projectile)) {
					if (collisionLine(ent.x,ent.y,ent.width*0.5,x1,y1,x2,y2,false)) {
						this.collide(ent);
					}
				}
			}
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
		if (Math.abs(this.xs)+Math.abs(this.ys)<5) {this.destroy();}
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