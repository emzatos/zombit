MAX_SER_DEPTH = 5;

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

idMap = {};
onScriptsLoaded.push(function(){
	idMap[ENTITY] = Entity;
	idMap[DROPPEDITEM] = DroppedItem;
	idMap[PLAYER] = Player;
	idMap[HOSTILE] = Hostile;
	idMap[ZOMBIE] = Zombie;
	idMap[PROJECTILE] = Projectile;
	idMap[BULLET] = Bullet;
	idMap[PARTICLE] = Particle;
	idMap[BLOODSPLAT] = BloodSplat;
});

//include entities
include("entities/Entity.js");
include("entities/Player.js");
include("entities/DroppedItem.js");
include("entities/hostile/Hostile.js");
include("entities/hostile/Zombie.js");
include("entities/particle/Particle.js");
include("entities/particle/BloodSplat.js");
include("entities/particle/Splatter.js");
include("entities/particle/Spark.js");
include("entities/particle/FloatingText.js");
include("entities/projectile/Projectile.js");
include("entities/projectile/Bullet.js");
include("entities/projectile/Glowstick.js");

makeNewent = function(ent) {
	return {ind: ent.arrIndex, type: ent.type, ser: ent.serializable()};
}

constructEntity = function(id) {
	return new idMap[id];
}