// called once every frame after processing
// compares how much time has passed since the last call.
// this is used to determine each frame

var FrameTimer = function() {
	this._lastTick = (new Date()).getTime();
};

FrameTimer.prototype = {
	returnSeconds: function() {
		var sec = this._frameSpacing/1000;
		if(isNaN(sec)) {
			return 0;
		}
		return sec;
	},

	tick: function() {
		var cTick = (new Date()).getTime();
		this._frameSpacing = cTick - this._lastTick;
		this._lastTick = cTick;
	}
};