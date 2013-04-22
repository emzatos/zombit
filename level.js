//Game levels:
function Tile(id,x,y) {
	this.id = id;
	this.x = x;
	this.y = y;
}

function Level(levelData) {
	this.data = levelData;

	function getWidth() {return data.length;}
	function getHeight() {return data[0].length;}

	function getTile(x,y) {
		return data[x<0?0:x>getWidth()?getWidth():x][y<0?0:y>getHeight()?getHeight():y];
	}

	function setTile(tile,x,y) {
		data[x][y] = tile;
	}
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