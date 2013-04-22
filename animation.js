/**
*
* takes a spritesheet definition
* and handles based on that.
* as each animation comprises specific frames
* calculations are made to determine how long a frame
* has been visible, frames change when they're visible for 
* a certain amount of time.
*/

/*
EXAMPLE:

Create animation with timings
that uses spritesheet sprites.

var hitZombie = new Animation([
	{sprite:'hit1', time:0.2},
	{sprite:'hit2', time:0.2},
	{sprite:'hideBat', time:0.3}
], sprites);

*/

var Animation = function(data, sprites) {
	this.load(data);
	this._sprites = sprites;
};

Animation.prototype = {
	_frames: [],
	_frame: null,
	_frameTime: 0,

	load: function(data) {
		this._frames = data;

		// init first frame
		this._frameIndex = 0;
		this._frameTime = data[0].time;
	},

	animate: function(delta) {
		// decrease time passed to show frame
		this._frameTime -= delta;

		// when the time to change frames arrives...
		if(this._frameTime <= 0) {
			// change frames
			this._frameIndex++;
			if(this._frameIndex == this._frames.length) {
				this._frameIndex = 0;
			}
			// increase to the next duration between frame switches
			this._frameTime = this._frames[this._frameIndex].time;
		}
	},

	// return the sprite for the current frame
	returnSprite: function() {
		return this._sprites.returnOffset(this._frames[this._frameIndex].sprite);
	}
};