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

	var onSegment = true;
	if (lineX2>lineX1) {
		if (xx>=lineX1 && xx<=lineX2) {}
		else {onSegment = false;}
	}
	else {
		if (xx>=lineX2 && xx<=lineX1) {}
		else {onSegment = false;}
	}

	if (lineY2>lineY1) {
		if (yy>=lineY1 && yy<=lineY2) {}
		else {onSegment = false;}
	}
	else {
		if (yy>=lineY2 && yy<=lineY1) {}
		else {onSegment = false;}
	}

	if (onSegment) {
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

/**
 * Stores and manages all entities.
 */
EntityManager = function() {
	this.entities = []; //stores entities
	this.freespace = []; //records indexes that are available
	this.types = []; //types of entities
}

/**
 * Register a new entity.  This should be performed upon the creation of a new entity
 * @param entity an entity to register
 */
EntityManager.prototype.register = function(entity) {
	if (this.entities.indexOf(entity)<0) {
		var ind;
		if (this.freespace.length>0) {
			ind = this.freespace.shift();
			this.entities[ind] = entity;
		}
		else {
			ind = this.entities.length;
			this.entities[ind] = entity;
		}
		return ind;
	}
}

/**
 * Remove an entity from the registry and free its id for future entities (mostly important in multiplayer)
 * @param entity an entity to unregister
 */
EntityManager.prototype.unregister = function(entity) {
	var typeofentity = typeof entity;
	var ind = typeofentity==="number" || typeofentity==="string"?entity:this.entities.indexOf(entity);
	if (ind>=0) {
		if (this.freespace.indexOf(ind)<0) {this.freespace.push(ind);}
		this.entities[ind] = undefined;
	} 
}

/**
 * Retrieve an entity from the registry.
 * @param thing an index number or an EntityReference wrapper
 */
EntityManager.prototype.get = function(thing) {
	var typeofthing = typeof thing;
	if (typeofthing === "number" || typeofthing === "string") { //entity index
		if (this.entities[thing] instanceof Entity) {
			return this.entities[thing];
		}
		return null;
	}
	else if (thing.arrIndex != null) { //entity reference (index in a wrapper)
		return this.entities[thing.arrIndex];
	}
	else {
		return null;
	}
}

/**
 * Set an entity in the registry
 * @param index index to set
 * @param entity the entity to store to it
 */
EntityManager.prototype.set = function(index, entity) {
	this.entities[index] = entity; //logan this is probably a bad idea do some input verification or something
}

EntityManager.prototype.length = function() {return this.entities.length;}

EntityManager.prototype.clearAll = function() {
	this.entities = [];
	this.freespace = [];
}

getEntityReference = function(erObj) { //works for literals and ER instances
	if (erObj && erObj.arrIndex!=null) {
		return entityManager.get(erObj.arrIndex);
	}
	else {return null;}
}
makeEntityReference = function(x) { //works for indexes, entities, and serialized ERs
	if (typeof x === 'number' || typeof x === 'string') {
		return {arrIndex: Number(x)};
	}
	else if (x!=null && !(typeof x === 'undefined') && !(typeof x.arrIndex === 'undefined')) {
		return {arrIndex: x.arrIndex};
	}
	else {
		return null;
	}
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
		var ind = entityManager.register(this);
		this.arrIndex = ind;
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

		if (this.life<=0) {this.die();}

		if (mpMode == SERVER) {
		networkManager.addProperties(this,
				[
					"x",
					"y",
					"xs",
					"ys",
					"life",
					"facing",
				],this.owner||io.sockets.broadcast);
		}
	},
	damage: function(amount) {
		this.life-=amount;
		if (particlesEnabled) {
			var ht = new FloatingText("-"+Math.round(amount),"255,55,55",this.x,this.y,100);
			ht.ys=-1;
			ht.xs=Math.random()*0.5-0.25;

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
		if (mpMode==SERVER) {
			io.sockets.emit("delent",{arrIndex: this.arrIndex});
		}

		entityManager.unregister(this.arrIndex);
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
	},
	distanceTo: function(ent) {
		if (ent instanceof Entity) {
			var dx = this.x-ent.x;
			var dy = this.y-ent.y;
			return Math.sqrt(dx*dx+dy*dy);
		}
		return 1;
	}
});
makeNewent = function(ent) {
	return {ind: ent.arrIndex, type: ent.type, ser: ent.serializable()};
}

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