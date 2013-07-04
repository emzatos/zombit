generateEmptyRoom = function(w,h) { //generates a level containing a floor with walls on the sides
	var lev = new Array(w);
	for (var x=0; x<w; x++) {
		lev[x]=new Array(h);
		for (var y=0; y<h; y++) {
			lev[x][y] = new Tile(x==0||x==w-1||y==0||y==h-1?WALL:FLOOR,x,y);
		}
	}
	return new Level(lev);
}

generateRectRooms = function(w,h,n)
{
	var level = generateEmptyRoom(w,h);
    var minX = 0;
    var minY = 0;
    var maxX = minX+w-1;
    var maxY = minY+h-1;
    
    //make some rooms
    for (var i=0; i<n; i++)
    {
        var x1 = irand(maxX-minX);
        var y1 = irand(maxY-minY);
        var x2 = x1+irand(maxX-minX-x1);
        var y2 = x2+irand(maxY-minY-y1);
        
        if (x2>maxX-minX) {x2=maxX-minX;}
        if (y2>maxY-minY) {y2=maxY-minY;}
        
        level = drawTileRect(level, x1, y1, x2, y2, WALL);
    }
    
    //knock out chunks
    for (var i=0; i<10; i++)
    {
        var x1 = irand(maxX-minX-(w/10));
        var y1 = irand(maxY-minY-(h/10));
        var x2 = x1+irand(w/5);
        var y2 = x2+irand(h/5);
        
        if (x2>maxX-minX) {x2=maxX-minX;}
        if (y2>maxY-minY) {y2=maxY-minY;}
        
        level = fillTileRect(level, x1, y1, x2, y2, FLOOR);
    }
    
    return level;
}

generateNoise = function(w,h,tt) {
	var lev = new Array(w);
	for (var x=0; x<w; x++) {
		lev[x]=new Array(h);
		for (var y=0; y<h; y++) {
			lev[x][y] = new Tile(tt[irand(tt.length-1)],x,y);
		}
	}
	return new Level(lev);
}

fillTileRect = function(level, x1, y1, x2, y2, type)
{
    for (var x=x1; x<=x2; x++)
    {
        for (var y=y1; y<=y2; y++)
        {
            level.setTile(new Tile(type,x,y),x,y);
        }
    }
    
    return level;
}

drawTileRect = function(level, x1, y1, x2, y2, type)
{
    for (var x=x1; x<=x2; x++)
    {
        level.setTile(new Tile(type,x,y1),x,y1);
        level.setTile(new Tile(type,x,y2),x,y2);
    }
    
    for (var y=y1; y<=y2; y++)
    {
        level.setTile(new Tile(type,x1,y),x1,y);
        level.setTile(new Tile(type,x2,y),x2,y);
    }
    
    return level;
}

generatePlants = function(level,prob) {
	for (var x=1; x<level.getWidth()-1; x++) {
		for (var y=1; y<level.getHeight()-1; y++) {
			var tl = level.getTile(x-1,y).id==WALL;
			var tr = level.getTile(x+1,y).id==WALL;
			var tu = level.getTile(x,y-1).id==WALL;
			var td = level.getTile(x,y+1).id==WALL;
			if (tl&&tu || tu&&tr || tr&&td || td&&tl) {
				if (Math.random()<prob) {
					//console.log("planted at "+x+","+y);
					level.setTile(new Tile(PLANT,x,y),x,y);
				}
			}
		}
	}
	return level;
}

punchOutWalls = function(level, prob) {
	for (var x=1; x<level.getWidth()-1; x++) {
		for (var y=1; y<level.getHeight()-1; y++) {
			if (Math.random()<prob && level.getTile(x,y).id==WALL) {
				level.setTile(new Tile(FLOOR,x,y),x,y);
			}
		}
	}
	return level;
}

//Game levels:
EMPTY=0, FLOOR=1, WALL=2, PLANT=3, DESK=4;
SOLIDS = [WALL];
Tile = function(id,x,y) {
	this.id = id;
	this.x = x;
	this.y = y;
	if (SOLIDS.indexOf(this.id)>=0) {this.solid = true;}
	else {this.solid = false;}
	//implement solid
}

images = new Array();
images = ["1.png", "2.png", "3.png", "4.png"];
tileImage = function(id) {
	return images[id];
}

Level = function(levelData) {
	this.data = levelData;
}
Level.prototype.getWidth = function(){return this.data.length;}
Level.prototype.getHeight = function(){return this.data[0].length;}
Level.prototype.getTile = function(x,y) {
	return this.data[x<0?0:x>this.getWidth()-1?this.getWidth()-1:x][y<0?0:y>this.getHeight()-1?this.getHeight()-1:y];
}
Level.prototype.setTile = function(tile,x,y) {
	this.data[x][y] = tile;
}
Level.prototype.chunkSet = function(chunk) {
	//console.log("set");
	//if (chunk.x>=0 && chunk.x+chunk.w<this.getWidth() && chunk.y>=0 && chunk.y+h<this.getHeight()) {
		for (var x=chunk.x; x<chunk.x+chunk.w; x++) {
			for (var y=chunk.y; y<chunk.y+chunk.h; y++) {
				this.setTile(chunk.tiles[x-chunk.x][y-chunk.y],x,y);
			}
		}
	//}
}
Level.prototype.getChunk = function(x,y,w,h) {
	var chunk = new Array();
	for (var i=0; i<w; i++) {
		chunk[i] = new Array();
		for (var j=0; j<h; j++) {
			chunk[i][j] = null;
		}
	}
	for (var xx=x; xx<x+w; xx++) {
		for (var yy=y; yy<y+h; yy++) {
			chunk[xx-x][yy-y] = this.getTile(xx,yy);
		}
	}
	return new Chunk(x,y,chunk);
}

chunkSize = 5;
Chunk = klass(function (x,y,tiles){
	this.x = x;
	this.y = y;
	this.tiles = tiles;
	this.w = tiles.length;
	this.h = tiles[0].length;
})
.methods ({
	getTile: function(x,y) {
		return tiles[x-this.x][y-this.y];
	}
});

Inventory = klass(function(size,owner) {
	this.size = size;
	this.owner = owner;
	this.inv = new Array();
	this.selected = 0;
})
.methods({
	push: function(item) {
		if (item instanceof Item) {
			if (this.inv.length<this.size) {
				item.user = makeEntityReference(this.owner);
				this.inv.push(item);
				return this.inv.length-1;
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	},

	pop: function(index) {
		index = Math.floor(index);
		if (index>=0 && index<this.inv.length) {
			this.inv[index].user = null;
			return this.inv.splice(index,1);
		}
		else {
			return false;
		}
	},

	set: function(index,item) {
		index = Math.floor(index);
		if (index>=0 && index<this.inv.length) {
			this.inv[index] = item;
		}
		else {
			return false;
		}
	},

	select: function(index) {
		if (index>=0 && index<this.inv.length) {
			this.selected = index;
			return index;
		}
		else {
			return false;
		}
	},

	get: function(index) {
		index = Math.floor(index);
		if (index>=0 && index<this.inv.length) {
			return this.inv[index];
		}
		else {
			return false;
		}
	},

	getSelected: function() {
		return this.inv[this.selected];
	},

	getArray: function() {
		return array_pad(this.inv,this.size,null);
	},
	
	serializable: function(output,depth) {
		if (depth>MAX_SER_DEPTH) {return;}
		//console.log(depth);
		if (!output) {output = {};}
		
		output.size = this.size;
		output.owner = makeEntityReference(this.owner.arrIndex);
		output.selected = this.selected;
		output.inv = [];
		
		for (var i=0; i<this.inv.length; i++) {
			output.inv[i] = this.inv[i].serializable({},depth+1);
		}
		
		//console.log(output);
		return output;
	},
	unserialize: function(src,dest) {
		console.log("THIS GOT CALLED");
		if (typeof dest === 'undefined') {dest = this;}
		for (var prop in src) {
			//console.log("    src["+prop+"] = "+src[prop]);
			if (typeof dest[prop] === 'undefined') {dest[prop] = {};}
			if (typeof src[prop] === 'object') {
				if (src[prop].type && src[prop].type>10000) {
					//if (!(dest[prop] instanceof Item)) {
						console.log("SOMETHING IS HAPPENING");
						
					//}
				}
				this.unserialize(src[prop],dest[prop]);
			}
			else {
				dest[prop] = src[prop];
			}
		}
	}
})

//must be over 10000
ITEM = 10001;
WEAPON = 10002;
MELEE = 10003;
WOODENBAT = 10004;
ZOMBIEATTACK = 10005;
GUN = 10006;
PISTOL = 10007;
ASSAULTRIFLE = 10008;
TYPHOON = 10009;
GAUSS = 10010;
NYANGUN = 10011;

Item = klass(function (name){
	this.name = name||"Unknown Item";
	this.arrIndex = items.push(this);
	this.snd = null;
	try{this.icon = genericIcon;}catch(e){}
	this.type = ITEM;
})
.methods ({
	step: function() {

	},
	destroy: function() {
		delete items[this.arrIndex];
	},
	serializable: function(output,depth) {
		if (!output) {output = {};}
		if (depth>MAX_SER_DEPTH) {return;}
		//console.log(depth);
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
					output[prop] = this[prop].serializable(output[prop],depth);
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
	unserialize: function(src,dest) {
		if (typeof dest === 'undefined') {dest = this;}
		for (var prop in src) {
			//console.log("    src["+prop+"] = "+src[prop]);
			if (typeof dest[prop] === 'undefined') {dest[prop] = {};}
			if (typeof src[prop] === 'object') {
				this.unserialize(src[prop],dest[prop]);
			}
			else {
				dest[prop] = src[prop];
			}
		}
	}
});

Weapon = Item.extend(function() {
})
.methods ({

});

Melee = Weapon.extend(function (range,width,delay,damage,user){
	this.range = range||5;
	this.width = width||10;
	this.delay = delay||10;
	this.damage = damage||5;
	this.user = makeEntityReference((user||player));
	this.timer = 0;
	this.type = MELEE;
})
.methods({
	step: function() {
		this.supr();
		if (this.timer>0) {this.timer-=1;}
	},
	fire: function() {
		if (this.timer==0) {
			if (this.snd) {this.snd.play();}

			//find all entities within range
			for (var ec = 0; ec<entities.length; ec++) {
		    	var ent = entities[ec];
				if (ent instanceof Entity) {
					var user = getEntityReference(this.user);
					var dst = pDist(user.x,user.y,ent.x,ent.y);
					var dr = Math.abs(pDir(user.x,user.y,ent.x,ent.y)-user.facing);
					//console.log("dist: "+dst+", dir: "+dr);
					if (dst<=this.range && ent!=user && dr<=radians(this.width)) {
						this.hit(ent);
						//console.log("hit! "+ent);
					}
				}
			}

			this.timer = this.delay;
		}
	},
	hit: function(entity) {
		//can override to perform custom effect
		if (entity instanceof Entity) {
			if (typeof entity.damage === 'function') {
				entity.damage(this.damage);
			}
		}
	}
});

WoodenBat = Melee.extend(function(){
	this.range = 40;
	this.width = 40;
	this.delay = 5;
	this.damage = 55;

	this.name = "Wooden Bat";
	try{this.icon = batIcon}catch(e){}
	this.type = WOODENBAT;
})
.methods({

});

ZombieAttack = Melee.extend(function(){
	this.range = 25;
	this.width = 40;
	this.delay = 5;
	this.damage = 5;

	this.name = "ZombieAttack";
	this.type = ZOMBIEATTACK;
})
.methods({

});

Gun = Weapon.extend(function(clipsize,ammo,delay,damage,spread,spd,user) {
	this.clipsize=clipsize||20;
	this.ammo=ammo||20;
	this.delay=delay||5;
	this.timer=0;

	this.damage = damage||10;
	this.spread = spread||3;
	this.spd = spd||17;
	this.friction = 0.001;
	this.shot = 1;
	
	this.user = makeEntityReference((user||player));

	this.snd = sndGun1;
	this.type = GUN;
	
	this.col1 = "255,205,0";
	this.col2 = "220,170,0";
})
.methods({
	step: function() {
		this.supr();
		if (this.timer>0) {this.timer-=1;}
		else if (this.ammo=="R") {this.ammo=this.clipsize;}
	},

	fire: function() {
		if (this.timer==0) {
			if (this.ammo=="R") {this.ammo=this.clipsize;}

			if (this.ammo>0) {
				this.ammo-=1;
				if (this.snd) {this.snd.play();}
				for (var i=0; i<this.shot; i++) {
					this.bullet();
				}
				//console.log("Fired! Ammo: "+this.ammo);

				this.timer=this.delay;
			}
			else {
				//console.log("Reloading");
				this.reload();
			}
		}
	},

	reload: function() {
		this.ammo = "R";
		this.timer = 100;
	},

	bullet: function() {
		//vector converted to xspeed/yspeed
		var user = getEntityReference(this.user);
		var dir = user.facing+radians(grand()*this.spread-this.spread*0.5);
		var xs = lDirX(this.spd,dir);
		var ys = lDirY(this.spd,dir);

		//create bullet and set speeds
		var blt = new Bullet(user.x,user.y,this.damage,user);
		blt.xs = xs;
		blt.ys = ys;
		blt.friction = this.friction*(0.8+grand(0.4));
		blt.col1 = this.col1;
		blt.col2 = this.col2;
		return blt;
	}
});

Pistol = Gun.extend(function(){
	this.name = "Pistol";
	this.clipsize = 20;
	this.ammo = 20;
	this.delay = 9;
	this.damage = 10;
	this.spread = 7;
	this.spd=19;
	this.snd = sndGun2;
	try{this.icon = pistolIcon;}catch(e){}
	this.type = PISTOL;
})
.methods({
});

AssaultRifle = Gun.extend(function(){
	this.name = "Assault Rifle";
	this.clipsize = 35;
	this.ammo = this.clipsize;
	this.delay = 4;
	this.damage = 15;
	this.spread = 3;
	this.spd = 24;
	this.snd = sndGun1;
	try{this.icon = assultIcon;}catch(e){}
	this.type = ASSAULTRIFLE;
})
.methods({
});

Typhoon = Gun.extend(function(){
	this.name = "Typhoon";
	this.clipsize = 200;
	this.ammo = this.clipsize;
	this.delay = 2;
	this.damage = 4;
	this.spread = 19;
	this.spd = 22;
	this.friction = 0.07;
	this.snd = sndGun3;
	try{this.icon = typhoonIcon;}catch(e){}
	this.type = TYPHOON;
})
.methods({
});

Gauss = Gun.extend(function(){
	this.name = "Gauss Rifle";
	this.clipsize = 8;
	this.ammo = this.clipsize;
	this.delay = 50;
	this.damage = 55;
	this.spread = 1;
	this.spd = 40;
	this.snd = sndGun2;
	try{this.icon = gaussIcon;}catch(e){}
	this.type = GAUSS;
})
.methods({
});

NyanGun = Gun.extend(function(){
	this.name = "Nyan Gun";
	this.clipsize = 500;
	this.ammo = this.clipsize;
	this.delay = 1;
	this.damage = 100;
	this.spread = 19;
	this.spd = 40;
	this.friction = 0.12;
	this.snd = sndGun3;

	this.colIndex = 0;
	this.type = NYANGUN;
})
.methods({
	bullet: function() { //for now, we must override this to set bullet color
		if (this.snd) {this.snd.play();}

		this.colIndex+=10;
		if (this.colIndex>=359) {this.colIndex = 0;}

		var c1 = "hsla(" + this.colIndex + ", 60%, 60%, 1)";
		var c2 = "hsla(" + this.colIndex + ", 40%, 40%, 0)";

		//vector converted to xspeed/yspeed
		var user = getEntityReference(user);
		var dir = user.facing+radians(grand()*this.spread-this.spread*0.5);
		var xs = lDirX(this.spd,dir);
		var ys = lDirY(this.spd,dir);

		//create bullet and set speeds
		var blt = new Bullet(user.x,user.y,this.damage,user);
		blt.xs = xs;
		blt.ys = ys;
		blt.friction = this.friction*(0.8+grand(0.4));

		blt.col1 = c1;
		blt.col2 = c2;
		return blt;
	}
});

itemIdMap = {};
itemIdMap[ITEM] = Item;
itemIdMap[WEAPON] = Weapon;
itemIdMap[MELEE] = Melee;
itemIdMap[WOODENBAT] = WoodenBat;
itemIdMap[ZOMBIEATTACK] = ZombieAttack;
itemIdMap[GUN] = Gun;
itemIdMap[PISTOL] = Pistol;
itemIdMap[ASSAULTRIFLE] = AssaultRifle;
itemIdMap[TYPHOON] = Typhoon;
itemIdMap[GAUSS] = Gauss;
itemIdMap[NYANGUN] = NyanGun;

constructItem = function(id) {
	try {return new itemIdMap[id];}
	catch (e) {console.log("Bad item ID: "+id); return null;}
}