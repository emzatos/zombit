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

//Game levels:
EMPTY=0, FLOOR=1, WALL=2, PLANT=3, DESK=4;
function Tile(id,x,y) {
	this.id = id;
	this.x = x;
	this.y = y;
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

//Game items:
ITEM=1, WEAPON=10, STATIC=100, GUN=200, PROJECTILE=300;
BAT = 1000, PISTOL = 1001, BULLET = 1002;

//Items
function Item(itemObj) { //generic constructable item container object
	this.item = itemObj;

	function isWeapon() {return (~~(item.type/10)%10)==1;}
	function isProjectile() {return (~~(item.type/100)%10)==3;}
	function isStatic() {return (~~(item.type/100)%10)==1;}
	function isGun() {return (~~(item.type/100)%10)==2;}
}

//Weapons
Bat = {
	id: BAT,
	type: ITEM+WEAPON+STATIC,
	damage: 1,
	delay: 4,
	range: 10
}

Pistol = {
	id: PISTOL,
	type: ITEM+WEAPON+GUN,
	damage: 3,
	delay: 4,
	range: 100
}

Bullet = {
	id: BULLET,
	type: ITEM+WEAPON+PROJECTILE,
	damage: 2
}