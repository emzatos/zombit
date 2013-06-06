tileAt = function(ex, ey) {
	var bx = Math.floor(ex/tileWidth);
	var by = Math.floor(ey/tileHeight);
	if (bx>0 && by>0 && bx<gameLevel.getWidth() && by<gameLevel.getHeight()) {
		return gameLevel.getTile(bx,by);
	}
	else {return null;}
}

pDir = function(x1,y1,x2,y2) {
	var xd = x2-x1;
	var yd = y2-y1;

	return fast_atan2(yd,xd);
}

pDist = function(x1,y1,x2,y2) {
	var xd = x2-x1;
	var yd = y2-y1;
	return Math.sqrt(xd*xd+yd*yd);
}

lDirX = function(len,dir) {
	var val = Math.cos(dir)*len
	return Math.abs(val)<0?0:val;
}

lDirY = function(len,dir) {
	var val = Math.sin(dir)*len
	return Math.abs(val)<0?0:val;
}

pVector = function(x1,y1,x2,y2,speed) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	var norm = Math.sqrt(dx * dx + dy * dy);
	if (norm)
	{
	    dx *= (speed / norm);
	    dy *= (speed / norm);
	}
	return [dx,dy];
}

radians = function(deg) {
	return deg*0.01745;
}

degrees = function(rad) {
	return rad*57.29577;
}

collisionLine = function(circleX,circleY,radius,lineX1,lineY1,lineX2,lineY2,returnPoints) {
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

collisionCircle = function(c1x,c1y,c1r,c2x,c2y,c2r) {
	if (pDist(c1x,c1y,c2x,c2y)<=c1r+c2r) {
		return true;
	}
	else {
		return false;
	}
}

Entity = klass(function (x,y) {
	this.x = x||50;
	this.y = y||50;
	this.xs = 0;
	this.ys = 0;
	this.friction = 0;
	this.life = 100;
	this.maxlife = this.life;

	this.facing = null;

	try {this.image = imgEntityGeneric;}
	catch (e) {}
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
		for (var xx=0; xx<Math.floor(sx); xx++) {
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
		var curtile = tileAt(this.x+(this.xs%1)+(xm*this.width*0.5),this.y);
		if (curtile!=null && curtile.id==FLOOR) {this.x+=(this.xs%1);}

		//move for yspeed
		var ym = this.ys>0?1:-1;
		for (var yy=0; yy<Math.floor(sy); yy++) {
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
		curtile = tileAt(this.x,this.y+(this.ys%1)+(ym*this.height*0.5));
		if (curtile!=null && curtile.id==FLOOR) {this.y+=(this.ys%1);}

		//apply friction
		this.xs*=1-this.friction;
		this.ys*=1-this.friction;

		//tell server to send updates
		this.mpUpdate();
		
		//deprecated
		/*this.x+=d(this.xs);
		this.y+=d(this.ys);*/
	},
	damage: function(amount) {
		this.life-=amount;
		for (var i=0; i<Math.ceil((amount/(this.maxlife>0?this.maxlife:1))*6); i++) {
			new BloodSplat(this.x-this.width*0.5+irand(this.width),this.y-this.height*0.5+irand(this.height),0,0);
		}
		if (this.life<=0) {this.die();}
	},
	die: function() {
		for (var i=0; i<6; i++) {
			new BloodSplat(this.x-this.width+irand(this.width*2),this.y-this.height+irand(this.height*2),0,0);
		}
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
	},
	mpUpdate: function() {
		if (mpMode==SERVER) {
			io.sockets.emit("entity",CircularJSON.stringify(this));
		}
	}
});

Player = Entity.extend(function(x,y,name,owner){
	this.name = name;
	this.owner = owner||window;
	try {this.image = imgPlayer_W;}
	catch (e) {}
	this.spdInc = 0.5;
	this.inv = new Inventory(6,this);
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
		if (mpMode==CLIENT) {
			viewX = ~~(this.x-viewWidth/2);
			viewY = ~~(this.y-viewHeight/2);

			//clip view pos
			
			if (viewX<0) {viewX=0;}
			if (viewX>gameLevel.getWidth()*tileWidth-viewWidth) {viewX = gameLevel.getWidth()*tileWidth-viewWidth;}
			if (viewY<0) {viewY=0;}
			if (viewY>gameLevel.getHeight()*tileHeight-viewHeight) {viewY = gameLevel.getHeight()*tileHeight-viewHeight;}
		}

		//point player toward mouse
		//player position corrected for view
		if (mpMode==CLIENT) {
			var pcx = this.x-viewX;
			var pcy = this.y-viewY;
			//console.log(pcx+","+pcy)

			//direction from corrected position to mouse
			var dir = pDir(pcx,pcy,mouseX,mouseY);
			player.facing = dir;
		}
	},
	damage: function(amount) {
		this.supr(amount);
		sndHit.play();
	},
	die: function() {
		gameScore = 0;
		this.life = 100;
		this.x = 50;
		this.y = 50;
		sndDie.play();
		for (var ec = 0; ec<entities.length; ec++) {
	    	var ent = entities[ec];
			if (ent instanceof Hostile) {
				ent.destroy();
			}
		}
	},

	/*
	* Change the player's image to face the
	* direction its moving.
	*/
	control: function() {
		//accept keyboard input
		if (this.owner.keys[VK_A]) {this.image=imgPlayer_A;this.xs-=d(this.spdInc);}
		if (this.owner.keys[VK_D]) {this.image=imgPlayer_D;this.xs+=d(this.spdInc);}
		if (this.owner.keys[VK_W]) {this.image=imgPlayer_W;this.ys-=d(this.spdInc);}
		if (this.owner.keys[VK_S]) {this.image=imgPlayer_S;this.ys+=d(this.spdInc);}
	}
});

T_SEARCH=0;
Hostile = Entity.extend(function(x,y,vr){
	this.target = T_SEARCH;
	this.visionRadius = vr||50;
	this.spd = 1;
	this.facing = 0;
	this.inv = new Inventory(1,this);
	this.pointValue = 10;
})
.methods({
	step: function() {
		this.supr();

		if (this.target==T_SEARCH) { //need to find a target (the player for now)
			//find the nearest target
			var minDist=Infinity,targ=null;
			for (var i=0; i<entities.length; i++) {
				if (entities[i] instanceof Player) {
					var dist = pDist(this.x,this.y,entities[i].x,entities[i].y);
					if (dist<minDist) {
						minDist = dist;
						targ = entities[i];
					}
				}
			}
			if (targ!=null) {
				if (pDist(this.x,this.y,targ.x,targ.y)<this.visionRadius) { //see if in range
					this.target = targ;
				}
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
	},

	die: function() {
		this.supr();
		gameScore+=this.pointValue;
		sndKill.play();
	}
});

Zombie = Hostile.extend(function(x,y,vr){
	try {this.image = imgZombie;}
	catch (e) {}
	this.spd=0.8;
	this.visionRadius = 160
	this.life = Math.round(Math.random()*150);
	this.pointValue = Math.round(0.5*this.life);
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

Projectile = Entity.extend(function(x,y,sender){
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

Bullet = Projectile.extend(function(x,y,damage,sender){
	this.damage = damage||20;
	this.xp=null;
	this.yp=null;
	try{his.image = imgBullet;}
	catch (e) {}
	this.sender = sender;

	this.col1 = "rgba(255,205,0,1)";
	this.col2 = "rgba(220,170,0,0)";
})
.methods({
	step: function() {
		this.supr();
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
		if (this.xp!=null) {
		var grad= ctx.createLinearGradient(x, y, this.xp, this.yp);
		grad.addColorStop(0, "rgba(255,255,255,1)");
		grad.addColorStop(1, "rgba(255,255,255,0.5)");

		var grad1= ctx.createLinearGradient(x, y, this.xp, this.yp);
		grad1.addColorStop(0, this.col1);
		grad1.addColorStop(1, this.col2);

		ctx.lineCap = "round";

		ctx.lineWidth = 3;
		ctx.strokeStyle = grad1;
		ctx.beginPath();
		ctx.moveTo(this.xp,this.yp);
		ctx.lineTo(x,y);
		ctx.stroke();

		ctx.lineWidth = 1;
		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.moveTo(this.xp,this.yp);
		ctx.lineTo(x,y);
		ctx.stroke();
		}
		this.xp=x;
		this.yp=y;
	}
});

Particle = klass(function(x,y,xs,ys,life) {
	this.x = x;
	this.y = y;
	this.xs = xs;
	this.ys = ys;
	this.maxlife = life;
	this.life = life;
	this.arrIndex = particles.push(this)-1;
	try {this.image = imgBloodSplat;}
	catch (e) {}
})
.methods({
	step: function() {
		this.x+=this.xs;
		this.y+=this.ys;

		this.life-=1;
		if (this.life<0) {this.destroy();}
	},
	render: function(x,y) {
		ctx.globalAlpha = this.life/this.maxlife;
		ctx.drawImage(this.image,x-this.image.width/2,y-this.image.height/2);
		ctx.globalAlpha = 1;
	},
	destroy: function() {
		particles.splice(this.arrIndex,1);
		//shift index of other items
		for (var i=this.arrIndex; i<particles.length; i++) {
			particles[i].arrIndex-=1;
		}
	},
});

BloodSplat = Particle.extend(function(x,y,xs,ys){
	this.x = x;
	this.y = y;
	this.xs = xs;
	this.ys = ys;
	this.life = 400;
	this.maxlife = this.life;
	try {this.image = imgBloodSplat;}
	catch (e) {}
})
.methods ({

});

