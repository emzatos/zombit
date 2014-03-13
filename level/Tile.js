EMPTY=0, FLOOR=1, WALL=2, PLANT=3, GRASS=4, WOODFLOOR=5;
SOLIDS = [WALL,PLANT];
DEPTHS = [0,0,2,2,0,0]; //depths: 0-bottom, 1-shadow layer, 2-top layer

Tile = function(id,x,y) {
	this.id = id;
	this.x = x;
	this.y = y;
	if (SOLIDS.indexOf(this.id)>=0) {this.solid = true;}
	else {this.solid = false;}
	this.depth = DEPTHS[this.id];
	//implement solid
}

tileImage = function(id) {
	return images[id];
}

isSolid = function(tile) {
	return SOLIDS.indexOf(tile.id)>=0;
}