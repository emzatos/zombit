function generateEmptyRoom(w,h) { //generates a level containing a floor with walls on the sides
	var lev = new Array(w);
	for (var x=0; x<w; x++) {
		lev[x]=new Array(h);
		for (var y=0; y<h; y++) {
			lev[x][y] = new Tile(x==0||x==w-1||y==0||y==h-1?WALL:FLOOR,x,y);
		}
	}
	return new Level(lev);
}

function generateRectRooms(w,h,n)
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

function fillTileRect(level, x1, y1, x2, y2, type)
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

function drawTileRect(level, x1, y1, x2, y2, type)
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

function generatePlants(level,prob) {
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

function punchOutWalls(level, prob) {
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
function Tile(id,x,y) {
	this.id = id;
	this.x = x;
	this.y = y;
	//implement solid
}

var images = new Array();
images = ["1.png", "2.png", "3.png", "4.png"];
function tileImage(id) {
	return images[id];
}

function Level(levelData) {
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

var Inventory = klass(function(size,owner) {
	this.size = size;
	this.owner = owner;
	this.inv = new Array();
	this.selected = 0;
})
.methods({
	push: function(item) {
		if (item instanceof Item) {
			if (this.inv.length<this.size) {
				item.user = this.owner;
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
	}
})

var Item = klass(function (name){
	this.name = name||"Item (Generic)";
	this.arrIndex = items.push(this);
	this.snd = null;
})
.methods ({
	step: function() {

	},
	destroy: function() {
		items.splice(this.arrIndex,1);
	}
});

var Weapon = Item.extend(function() {
	
})
.methods ({

});

var Melee = Weapon.extend(function (range,width,delay,damage,user){
	this.range = range||5;
	this.width = width||10;
	this.delay = delay||10;
	this.damage = damage||5;
	this.timer = 0;
	this.user = user||player;
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
					var dst = pDist(this.user.x,this.user.y,ent.x,ent.y);
					var dr = Math.abs(pDir(this.user.x,this.user.y,ent.x,ent.y)-this.user.facing);
					//console.log("dist: "+dst+", dir: "+dr);
					if (dst<=this.range && ent!=this.user && dr<=radians(this.width)) {
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
			entity.damage(this.damage);
		}
	}
});

var WoodenBat = Melee.extend(function(){
	this.range = 40;
	this.width = 40;
	this.delay = 5;
	this.damage = 55;

	this.name = "Wooden Bat";
})
.methods({

});

var ZombieAttack = Melee.extend(function(){
	this.range = 25;
	this.width = 40;
	this.delay = 5;
	this.damage = 5;

	this.name = "ZombieAttack";
})
.methods({

});

var Gun = Weapon.extend(function(clipsize,ammo,delay,damage,spread,spd,user) {
	this.clipsize=clipsize||20;
	this.ammo=ammo||20;
	this.delay=delay||5;
	this.timer=0;

	this.damage = damage||10;
	this.spread = spread||3;
	this.spd = spd||17;
	this.friction = 0.001;

	this.user = user||player;

	this.snd = sndGun1;
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
				this.bullet();
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
		if (this.snd) {this.snd.play();}

		//vector converted to xspeed/yspeed
		var dir = this.user.facing+radians(grand()*this.spread-this.spread*0.5);
		var xs = lDirX(this.spd,dir);
		var ys = lDirY(this.spd,dir);

		//create bullet and set speeds
		var blt = new Bullet(this.user.x,this.user.y,this.damage,this.user);
		blt.xs = xs;
		blt.ys = ys;
		blt.friction = this.friction*(0.8+grand(0.4));
		return blt;
	}
});

var Pistol = Gun.extend(function(){
	this.name = "Pistol";
	this.clipsize = 20;
	this.ammo = 20;
	this.delay = 9;
	this.damage = 10;
	this.spread = 7;
	this.spd=19;
	this.snd = sndGun2;
})
.methods({
});

var AssaultRifle = Gun.extend(function(){
	this.name = "Assault Rifle";
	this.clipsize = 35;
	this.ammo = this.clipsize;
	this.delay = 4;
	this.damage = 15;
	this.spread = 3;
	this.spd = 24;
	this.snd = sndGun1;
})
.methods({
});

var Typhoon = Gun.extend(function(){
	this.name = "Typhoon";
	this.clipsize = 200;
	this.ammo = this.clipsize;
	this.delay = 2;
	this.damage = 4;
	this.spread = 19;
	this.spd = 22;
	this.friction = 0.07;
	this.snd = sndGun3;
})
.methods({
});

var Gauss = Gun.extend(function(){
	this.name = "Gauss Rifle";
	this.clipsize = 8;
	this.ammo = this.clipsize;
	this.delay = 50;
	this.damage = 55;
	this.spread = 1;
	this.spd = 40;
	this.snd = sndGun2;
})
.methods({
});