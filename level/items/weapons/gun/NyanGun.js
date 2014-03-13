NyanGun = Gun.extend(function(){
	this.name = "Nyan Gun";
	this.clipsize = Infinity;
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
.statics({
	hslToRgb: function(h, s, l) {
	    var r, g, b;

	    if(s == 0){
	        r = g = b = l; // achromatic
	    }else{
	        function hue2rgb(p, q, t){
	            if(t < 0) t += 1;
	            if(t > 1) t -= 1;
	            if(t < 1/6) return p + (q - p) * 6 * t;
	            if(t < 1/2) return q;
	            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	            return p;
	        }

	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1/3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1/3);
	    }

	    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
})
.methods({
	bullet: function() { //for now, we must override this to set bullet color
		if (this.snd) {this.snd.play();}

		this.colIndex+=10;
		if (this.colIndex>=359) {this.colIndex = 0;}

		var col1 = NyanGun.hslToRgb(this.colIndex/360, 0.6, 0.6);
		var col2 = NyanGun.hslToRgb(this.colIndex/360, 0.4, 0.4);

		this.col1 = col1[0]+","+col1[1]+","+col1[2];
		this.col2 = col2[0]+","+col2[1]+","+col2[2];

		this.supr();
	}
});