// faster trig
// based off of: http://www.shellandslate.com/computermath101.html

// constants
var buffer 	= new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT);
var fv 		= new Float32Array(buffer);
var lv		= new Uint32Array(buffer);
var th 		= 1.5;

function radians(degrees) {
	return degrees * (Math.PI / 180.0);
}
      
function degrees(radians) {
	return radians * (180.0 / Math.PI);
}

// generate lookup tables
function genTable(res, method) {
	var table = [];
	var i = 360.0/res;

	for(var j=0; j<=360.0; j+=i) {
		var index = Math.round(j/i);
		table[index] = method(radians(i));
	}
	return table;
}

/**
* In order to yield accurate cos/sin using
* the LUTs, I need to recalculate the tables
* using the genSinCosTables() method everytime
* I wish to find the next value. This may or may not
* be faster.
*
* e.g:
*		onMouseMove(cos_res+=1.0;sin_res+=1.0;genSinCosTables();)
*/

// fast cos/sin default values
var cos_res	= 6.0;	// cosine and sine resolutions
var sin_res = 6.0;
var icos_m	= cos_res / 360.0;
var isin_m	= sin_res / 360.0;
var cos 	= genTable(cos_res, Math.cos); // generate the tables for sin and cos
var sin 	= genTable(sin_res, Math.sin);

// generate the tables for sin and cos
function genSinCosTables() {
	var icos_m	= cos_res / 360.0;
	var isin_m	= sin_res / 360.0;
	var cos 	= genTable(cos_res, Math.cos); // generate the tables for sin and cos
	var sin 	= genTable(sin_res, Math.sin);
}

// fast atan2
function fast_atan2(y, x) {
    var cf_1 = Math.PI / 4.0;
    var cf_2 = 3.0 * cf_1;
    var abs_y = Math.abs(y);
    var angle;
    
    if(x>=0) {
        var r = (x-abs_y)/(x+abs_y);
        angle = cf_1-cf_1*r;
    } else {
    	var r = (x+abs_y)/(abs_y-x);
    	angle = cf_2-cf_1*r;
    }
    return y<0 ? -angle:angle;
}

// extremely fast inverse sqrt
// same one used in Quake II
function invsqrt(x) {
	var x2 = x * 0.5;
	fv[0] = x;
	lv[0] = 0x5f3759df-(lv[0]>>1);
	var y = fv[0];
	y = y*(th-(x2*y*y));

	return y;
}

function fast_sin(x) {

}

/* BENCHMARK CODE
// test if the method is actually faster
function testTime(fn, range, step) {
	var start = new Date();
	for(var y=-range;y<range;y+=step) {
		for(var x=-range;x<range;x+=step) {
			fn(x, y);
		}		
	}
	var end = new Date();
	return end-start;
}

// check the accuracy of the new atan2
function checkAccuracy(fn1, fn2, range, step) {
	var maxError = 0;
	var maxErrorVal = [];

	for(var y=-range;y<range;y+=step) {
		for(var x=-range;x<range;x+=step) {
			var first = fn1(x, y);
			var second = fn2(x, y);
			var error = Math.abs(first-second);
			if(error>maxError) {
				maxError = error;
				maxErrorVal = [x, y];
			}
		}		
	}
	return {error:maxError, values:maxErrorVal};
}

function test(range, step) {
	console.log("calc for range:"+(-range)+"..."+range+" step of"+step);
	console.log("Math.atan2: ");
	console.log(testTime(Math.atan2, range, step)+" ms");
	console.log("fast_atan2: ");
	console.log(testTime(fast_atan2, range, step)+" ms");
	console.log("");
	console.log("test accuracy");
	var accuracy = checkAccuracy(Math.atan2, fast_atan2, range, step);
	console.log("min errors: "+accuracy.error);
	console.log("value causing error: "+accuracy.values);
}
*/