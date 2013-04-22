// abstract to calculate the specific location of a sprite
// on a spritesheet.

/*
EXAMPLE:

var sprites = new Sheet({
	width: 32,
	height: 32,
	sprites: [
		{name: 'stand'},
		{name: 'hit_1', x:0, y:1},
		{name: 'hit_2', x:31, y:32},
	]
});

*/

var Sheet = function(src) {
	this.load(src);
};

// prototype of SpriteSheet
Sheet.prototype = {
	_sprites: [],
	_width: 0,
	_height: 0,

	load: function(src) {
		this._width = src.width;
		this._height = src.height;
		this._sprites = src.sprites;
	},

	returnOffset: function(spriteId) {
		// loop through the sprites to return the on we need
		for(var i = 0, len = this._sprites.length; i<len; i++) {
			var sprite = this._sprites[i];
			if(sprite.name == spriteId) {
				// multiply by sprite width
				// after doing so the x, y offset is added
				return {
					x: (i*this._width) + (sprite.x||0),
					y: (sprite.y||0),
					width: this._width,
					height: this._height
				};
			}
		}

		return null;
	}
};