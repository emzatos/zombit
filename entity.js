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

collisionLine2 = function(circleX,circleY,radius,lineX1,lineY1,lineX2,lineY2) {
	var d1 = pDist(lineX1,lineY1,circleX,circleY);
	var d2 = pDist(lineX2,lineY2,circleX,circleY);
	if (d1<=radius || d2<=radius) {
		return true;
	}

	var k1 = ((lineY2-lineY1)/(lineX2-lineX1));
	var k2 = lineY1;
	var k3 = -1/k1;
	var k4 = circleY;

	var xx = (k1*lineX1-k2-k3*circleX+k4)/(k1-k3);
	var yy = k1*(xx-lineX1)+lineY1;

	var bueno = true;
	if (lineX2>lineX1) {
		if (xx>=lineX1 && xx<=lineX2) {}
		else {bueno = false;}
	}
	else {
		if (xx>=lineX2 && xx<=lineX1) {}
		else {bueno = false;}
	}

	if (lineY2>lineY1) {
		if (yy>=lineY1 && yy<=lineY2) {}
		else {bueno = false;}
	}
	else {
		if (yy>=lineY2 && yy<=lineY1) {}
		else {bueno = false;}
	}

	if (bueno) {
		if (pDist(circleX,circleY,xx,yy)<radius) {
			return true;
		}
		else {
			return false;
		}
	}
	else {
		return false;
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

//may not go over 10000
ENTITY = 10;
DROPPEDITEM = 9010;
PLAYER = 110;
HOSTILE = 210;
ZOMBIE = 1210;
PROJECTILE = 310;
BULLET = 1310;
PARTICLE = 410;
BLOODSPLAT = 1410;

EntityReference = function(obj) {
	this.arrIndex = null;

	this.make = function(obj) {
		this = makeEntityReference(obj);
	}
	
	this.get = function() {
		thisgetEntityReference(this);
	}
	
	this.serializable = function() {
		return {arrIndex: this.arrIndex}; //because we don't want to send the functions, and we want this to be automagically serializable by Entity
	}
	
	this.unserialize = function(src,dest) {
		dest = new EntityReference(getEntityReference(src)); //again, because we want automagic unserialization
	}
	
	makeEntityReference(obj);
}
getEntityReference = function(erObj) { //works for literals and ER instances
	if (erObj && erObj.arrIndex!=null) {
		return entities[erObj.arrIndex];
	}
	else {return null;}
}
makeEntityReference = function(x) { //works for indexes, entities, and serialized ERs
	if (typeof x === 'number') {
		return {arrIndex: x};
	}
	else if (x!=null && !(typeof x === 'undefined') && !(typeof x.arrIndex === 'undefined')) {
		return {arrIndex: x.arrIndex};
	}
	else {
		return null;
	}
}

findSlot = function() {
	if (entities.length==0) {return 0;}
	for (var i=0, j=entities.length; i<j; i++) {
		if (entities[i] == undefined) {return i;}
	}
	return entities.length;
}
MAX_SER_DEPTH = 5;
Entity = klass(function (x,y) {
	this.x = x||50;
	this.y = y||50;
	this.xs = 0;
	this.ys = 0;
	this.friction = 0;
	this.life = 100;
	this.maxlife = this.life;

	this.dropchance = 0.1;

	this.type = ENTITY;

	this.facing = null;

	try {this.image = imgEntityGeneric;}
	catch (e) {}
	this.width = tileWidth;
	this.height = tileHeight;

	//entity management code
	if (!mpActive || mpMode==SERVER) {
		var slot = findSlot();
		//console.log(slot);
		entities[slot] = this;
		this.arrIndex = slot;
		
		//this.arrIndex = entities.push(this)-1;
	}
})
.methods({
	emitConstruct: function() {
		if (!(typeof io === 'undefined') && mpMode==SERVER) {
			//console.log("EMITTING NEWENT");
			//console.dir([this.arrIndex,this.type,this.serializable()]);
			io.sockets.emit("newent",makeNewent(this));
			this.mpUpdate();
		}
		else {
			//nothing to see here, move along
			//console.log("Server not operational, cannot emit.");
		}
	},
	step: function(dlt) {
		var sx = Math.abs(dlt*this.xs);
		var sy = Math.abs(dlt*this.ys);

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
		this.xs*=1-(this.friction*dlt);
		this.ys*=1-(this.friction*dlt);

		//tell server to send updates
		this.mpFrameUpdate();
		
		//deprecated
		/*this.x+=d(this.xs);
		this.y+=d(this.ys);*/
	},
	damage: function(amount) {
		this.life-=amount;
		if (particlesEnabled) {
			for (var i=0; i<Math.ceil((amount/(this.maxlife>0?this.maxlife:1))*6); i++) {
				new BloodSplat(this.x-this.width*0.5+irand(this.width),this.y-this.height*0.5+irand(this.height),0,0);
			}
		}
		if (this.life<=0) {this.die();}
	},
	die: function() {
		if (mpMode==CLIENT) {
			for (var i=0; i<6; i++) {
				new BloodSplat(this.x-this.width+irand(this.width*2),this.y-this.height+irand(this.height*2),0,0);
			}
		}

		if (Math.random()<this.dropchance) {
			this.doDrops();
		}

		this.destroy();
	},
	
	doDrops: function() {
		//drop items upon death
	},

	collide: function(tile) {
		//override with collision logic
	},
	render: function(x,y) {
		if (entityShadows) {
			ctx.globalAlpha = 0.4;
			ctx.drawImage(imgShadow,x-tileWidth/2,y+tileHeight/5,tileWidth,tileHeight/2);

			ctx.globalAlpha = 1;
		}
		ctx.drawImage(this.image,x-tileWidth/2,y-tileHeight/2,tileWidth,tileHeight);
	},
	destroy: function() {
		/*entities.splice(this.arrIndex,1);
		//shift index of other items
		for (var i=this.arrIndex; i<entities.length; i++) {
			entities[i].arrIndex-=1;
		}*/
		
		//delete entities[this.arrIndex];
		entities[this.arrIndex] = undefined;
		
		if (mpMode==SERVER) {
			io.sockets.emit("delent",{arrIndex: this.arrIndex});
		}
	},
	mpUpdate: function() {
		if (mpMode==SERVER) {
			try {
				//io.sockets.emit("entity",CircularJSON.stringify(this, safeJSON));
				
				var ser = this.serializable();
				io.sockets.emit("entity",ser);
				//console.log(ser);
			}
			catch (e) {
				//console.log(this);
				console.log(e);
			}
		}
	},
	mpFrameUpdate: function() {
		this.mpUpdate();
	},
	serializable: function(output,depth) {
		if (!depth) {depth = 0;}
		if (depth>MAX_SER_DEPTH) {return;}
		//console.log(arguments.callee.caller.toString() + ": "+depth);
		if (!output) {output = {};}
		//else {output = EntityReference.make(this);}
		
		for (var prop in this) {
			if (this[prop] != null && this[prop] != undefined) {
			//console.log("setting "+prop);
				if (prop == "owner") {
					//this has to be here for some reason
				}
				else if (typeof this[prop] === 'undefined') {
					output[prop] = undefined;
				}
				else if (typeof this[prop].serializable === 'function') {
					output[prop] = this[prop].serializable(output[prop],depth+1);
					//console.log("ser");//soutput = "SER";
				}
				else if (!(typeof this[prop] === 'function')) {			
					if (typeof this[prop] === 'object') {
						//needs a serializer
					}
					else {
						output[prop] = this[prop];
					}
				}
			}
		}
		
		delete output.owner; //shhh it's okay
		
		return output;
	},
	unserialize: function(src,dest,depth) {
		if (!depth) {depth = 0;}
		if (typeof dest === 'undefined') {dest = this;}
		for (var prop in src) {
			//console.log("    ".repeat(depth)+"src["+prop+"] = "+src[prop]);
			if (typeof dest[prop] === 'undefined' || dest[prop] == null) {dest[prop] = {};}
			/*console.log("Deserializing:");
			console.log(" dest[prop] = ");
			console.dir(dest[prop]);
			console.log(" src[prop] = ");
			console.dir(src[prop]);*/
			if (src[prop].type && src[prop].type>10000) {
				//console.log("hurp");
				if (dest[prop].type != src[prop].type) {dest[prop] = constructItem(src[prop].type);}
				dest[prop].unserialize(src[prop],dest[prop]);
			}
			else if (typeof src[prop] === 'object') {
				this.unserialize(src[prop],dest[prop],depth+1);
			}
			else {
				dest[prop] = src[prop];
			}
		}
	}
});
makeNewent = function(ent) {
	return {ind: ent.arrIndex, type: ent.type, ser: ent.serializable()};
}

var DROPTIMEOUT = 500;
DroppedItem = Entity.extend(function(x,y,item){
	this.x = x;
	this.y = y;
	this.item = item;
	this.type = DROPPEDITEM;
	this.timestamp = Date.now();
	this.friction = 0.1;

	//console.log("Dropped a(n) "+item.name);
})
.methods({
	step: function(dlt) {
		this.supr(dlt);
		if (Date.now()-this.timestamp>DROPTIMEOUT) {
			for (en in entities) {
				if (entities[en] instanceof Player) {
					if (Math.abs(entities[en].x-this.x)+Math.abs(entities[en].y-this.y)<tileWidth) {
						if (entities[en].inv.push(this.item)!=false) {
							this.destroy();
							break;
						}
					}
				}
			}
		}
	},
	render: function(x,y) {
		if (entityShadows) {
			ctx.globalAlpha = 0.4;
			ctx.drawImage(imgShadow,x-tileWidth/2,y+tileHeight/4,tileWidth,tileHeight/2);

			ctx.globalAlpha = 1;
		}
		if (this.item.icon) {ctx.drawImage(this.item.icon,x-tileWidth/2,y-tileHeight/2,tileWidth,tileHeight);}
	},
	damage: function() {
	},
});

Player = Entity.extend(function(x,y,name,owner){
	this.name = name;
	this.owner = owner||window;
	try {this.image = imgPlayer_W;}
	catch (e) {}
	this.spdInc = 0.5;
	this.inv = new Inventory(7,this);
	this.friction = 0.2;
	this.facing = 0;
	this.maxSpd = 5;

	this.type = PLAYER;
	
	this.emitConstruct();
})
.methods({
	step: function(dlt) {
		this.supr(dlt);

		if (Math.abs(this.xs)<0.1) {this.xs = 0;}
		if (Math.abs(this.ys)<0.1) {this.ys = 0;}

		this.control();

		//clip speed
		if (this.xs>this.maxSpd) {this.xs=this.maxSpd;}
		if (this.xs<-this.maxSpd) {this.xs=-this.maxSpd;}
		if (this.ys>this.maxSpd) {this.ys=this.maxSpd;}
		if (this.ys<-this.maxSpd) {this.ys=-this.maxSpd;}

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
		if (mpMode==CLIENT && !(typeof player === 'undefined')) {
			var pcx = this.x-viewX;
			var pcy = this.y-viewY;
			//console.log(pcx+","+pcy)

			//direction from corrected position to mouse
			var dir = pDir(pcx,pcy,mouseX,mouseY);
			player.facing = dir;
		}
	},
	render: function(x,y) {
		this.supr(x,y);
		//if (this != player) {
			ctx.font = '8px "uni"';
			ctx.textAlign = 'center';
			var tw = ctx.measureText(this.name).width;
			
			ctx.fillStyle = "rgba(0,0,0,0.25)";
			ctx.fillRect(x-tw/2-2,y-this.image.height/2-13,tw+4,12);
			
			ctx.fillStyle = "rgba(255,255,255,0.5)";
			ctx.fillText(this.name, x, y-12);
			
			ctx.textAlign = 'left';
		//}
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
		
		//inv selection keys
		for (var nk=49; nk<58; nk++) {
			if (this.owner.keys[nk]) {this.inv.select(nk-49);}
		}

		//reload
		if (this.inv && this.inv.getSelected()) {
			var rel = this.inv.getSelected().reload;
			if (this.owner.keys[VK_R] && typeof rel === 'function') {this.inv.getSelected().reload();}
		}
		
		//drop items
		if (this.inv && this.inv.getSelected() && this.inv.inv.length>1) {
			if (this.owner.keys[VK_Q]) {
				this.owner.keys[VK_Q] = false;
				var dr = new DroppedItem(this.x,this.y,this.inv.pop(this.inv.selected)[0]);
				dr.xs = lDirX(5,this.facing);
				dr.ys = lDirY(5,this.facing);
			}
		}
		
		//process mouse input
		if (this.owner.mouseLeft) {
			var item = this.inv.getSelected();
			if (item instanceof Weapon) {
				item.fire();
			}
		}
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

	this.type = HOSTILE;
})
.methods({
	mpFrameUpdate: function() { //don't update automagically
	},
	step: function(dlt) {
		this.supr(dlt);

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
					this.target = makeEntityReference(targ);
					this.mpUpdate();
				}
			}
		}
		else {
			var targ = getEntityReference(this.target);
			var targetDist = pDist(this.x,this.y,targ.x,targ.y);
			var targetDir = pDir(this.x,this.y,targ.x,targ.y);
			this.facing = targetDir;

			if (targetDist>this.visionRadius*2) { //see if too far to follow
				targ = T_SEARCH; //reset target
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
					this.attack(targ);
					this.mpUpdate();
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
		if (mpMode != SERVER) {gameScore+=this.pointValue;}
		sndKill.play();
	}
});

var ZOMBIEMAXLIFE = 500;
Zombie = Hostile.extend(function(x,y,vr){
	try {this.image = imgZombie;}
	catch (e) {}
	this.spd=0.8;
	this.visionRadius = 160
	this.life = Math.round(Math.random()*ZOMBIEMAXLIFE);
	this.maxlife = this.life;
	this.pointValue = Math.round(0.5*this.life);
	this.inv.push(new ZombieAttack());

	this.type = ZOMBIE;
	this.emitConstruct();
})
.methods({
	step: function(dlt) {
		this.supr(dlt);

		if (this.target==T_SEARCH) {
			//randumbly wander if no target
			if (Math.random()<0.01) {
				this.xs = -1+Math.random()*2;
				this.ys = -1+Math.random()*2;
				this.mpUpdate();
			}
		}
	},

	doDrops: function() {
		var gun = new RandomGun((this.maxlife/ZOMBIEMAXLIFE)*0.7);
		new DroppedItem(this.x,this.y,gun);
		
	},

	die: function() {
		this.supr();
	}
});

Projectile = Entity.extend(function(x,y,sender){
	this.sender = makeEntityReference(sender)||null;
	this.width = 1;
	this.height = 1;
	this.friction = 0;

	this.type = PROJECTILE;
	
})
.methods({
	step: function(dlt) {
		this.supr(dlt);

		//check for entity collisions
		var x1=this.x-this.xs;
		var y1=this.y-this.ys;
		var x2=this.x;
		var y2=this.y;

		var senderObj = getEntityReference(this.sender);
    	for (var ec = 0; ec<entities.length; ec++) {
	    	ent = entities[ec];
			if (ent instanceof Entity) {
				if (ent!=senderObj && ent!=this && !(ent instanceof Projectile)) {
					if (collisionLine2(ent.x,ent.y,ent.width*0.5,x1,y1,x2,y2,false)) {
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
	try{this.image = imgBullet;}
	catch (e) {}
	this.sender = makeEntityReference(sender);
	
	this.col1 = "255,205,0";
	this.col2 = "220,170,0";
	
	this.light = null;

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
			this.light = new EntityLight(this,"rgba("+this.col1+",0.2)",80);
			registerLight(this.light);
		}
	
		if (this.xp!=null) {
		/*var grad= ctx.createLinearGradient(x, y, this.xp, this.yp);
		grad.addColorStop(0, "rgba(255,255,255,1)");
		grad.addColorStop(1, "rgba(255,255,255,0.5)");*/

		var grad0= ctx.createLinearGradient(x, y, this.xp, this.yp);
		grad0.addColorStop(0, "rgba(255,255,255,1)");
		grad0.addColorStop(1, "rgba(255,255,255,0.5)");
		
		var grad1= ctx.createLinearGradient(x, y, this.xp, this.yp);
		grad1.addColorStop(0, "rgba("+this.col1+",1)");
		grad1.addColorStop(1, "rgba("+this.col2+",0)");
		
		ctx.lineCap = "round";

		ctx.lineWidth = 5;
		ctx.strokeStyle = grad1;
		ctx.beginPath();
		ctx.moveTo(this.xp,this.yp);
		ctx.lineTo(x,y);
		ctx.stroke();

		ctx.lineWidth = 2;
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
		this.supr();
	}
});

Glowstick = Projectile.extend(function(x,y,owner) {
	this.x = x;
	this.y = y;
	this.owner = owner;
	this.light = null;
	
	this.brightness = 255;
	this.col = "10,"+Math.floor(this.brightness)+",10";

	try {this.image = glowstickIcon;}
	catch (e) {}
})
.methods({
	step: function(dlt) {
		this.supr(dlt);
		this.light.size-=0.1;
		this.brightness-=0.1;
		this.col = "10,"+Math.floor(this.brightness)+",10";
		if (this.light.size<0) {this.destroy();}
	},
	render: function(x,y) {
		ctx.drawImage(this.image,x-tileWidth/2,y-tileHeight/2,tileWidth,tileHeight);

		if (this.light==null) {
			this.light = new EntityLight(this,"rgba("+this.col+",0.5)",255);
			registerLight(this.light);
		}
	},
	destroy: function() {
		unregisterLight(this.light);
		this.supr();
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

	this.type = PARTICLE;
})
.methods({
	step: function(dlt) {
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
	try {this.image = [imgBloodSplat1,imgBloodSplat2,imgBloodSplat3][Math.floor(Math.random()*3)];}
	catch (e) {}

	this.type = BLOODSPLAT;
})
.methods ({

});

idMap = {};
idMap[ENTITY] = Entity;
idMap[DROPPEDITEM] = DroppedItem;
idMap[PLAYER] = Player;
idMap[HOSTILE] = Hostile;
idMap[ZOMBIE] = Zombie;
idMap[PROJECTILE] = Projectile;
idMap[BULLET] = Bullet;
idMap[PARTICLE] = Particle;
idMap[BLOODSPLAT] = BloodSplat;
constructEntity = function(id) {
	return new idMap[id];
}