EMPTY=0, FLOOR=1, WALL=2, PLANT=3, DESK=4;
SOLIDS = [WALL];
DEPTHS = [0,0,2,2,2]; //depths: 0-bottom, 1-shadow layer, 2-top layer

Tile = function(id,x,y) {
	this.id = id;
	this.x = x;
	this.y = y;
	if (SOLIDS.indexOf(this.id)>=0) {this.solid = true;}
	else {this.solid = false;}
	this.depth = DEPTHS[this.id];
	//implement solid
}

images = new Array();
images = ["1.png", "2.png", "3.png", "4.png", "5.png"];
tileImage = function(id) {
	return images[id];
}