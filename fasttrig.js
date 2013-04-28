// faster trig
// based off of: http://www.shellandslate.com/computermath101.html

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