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
					console.log("planted at "+x+","+y);
					level.setTile(new Tile(PLANT,x,y),x,y);
				}
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