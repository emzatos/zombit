//shut up, this is a great place to define these!
INPUT_KB = 1;
INPUT_MOUSE = 2;

CLIENT = 1;
SERVER = 2;
mpMode = SERVER;

//util
irand = function(max) {
	if (max) {return Math.round(Math.random()*max);}
	else {return Math.round(Math.random());}
}

grand = function(max) {
	if (max) {return (((Math.random()+Math.random())/2)*max);}
	else {return ((Math.random()+Math.random())/2);}
}

array_pad  = function(input, pad_size, pad_value) {
  // http://kevin.vanzonneveld.net
  // +   original by: Waldo Malqui Silva

  var pad = [],
    newArray = [],
    newLength,
    diff = 0,
    i = 0;

  if (Object.prototype.toString.call(input) === '[object Array]' && !isNaN(pad_size)) {
    newLength = ((pad_size < 0) ? (pad_size * -1) : pad_size);
    diff = newLength - input.length;

    if (diff > 0) {
      for (i = 0; i < diff; i++) {
        newArray[i] = pad_value;
      }
      pad = ((pad_size < 0) ? newArray.concat(input) : input.concat(newArray));
    } else {
      pad = input;
    }
  }

  return pad;
}

doLine = function(x1,y1,x2,y2,functionToDo,deres)
{
	deres = deres||1;
    var dX,dY,iSteps;
    var xInc,yInc,iCount,x,y;

    dX = x1 - x2;
    dY = y1 - y2;

    if (Math.abs(dX) > Math.abs(dY))
    {
        iSteps = Math.abs(dX);
    }
    else
    {
        iSteps = Math.abs(dY);
    }

    xInc = dX/iSteps;
    yInc = dY/iSteps;

    x = x1;
    y = y1;

    for (iCount=1; iCount<=iSteps; iCount+=deres)
    {
        functionToDo(Math.floor(x),Math.floor(y));
        x -= xInc;
        y -= yInc;
    }
}

//store random numbers for very fast random number generation (for shaders, etc.)
frandArray = new Array(20000);
for (var i=0; i<frandArray.length; i++) {frandArray[i] = Math.random();}
frandPtr = 0;
frand = function() {
	frandPtr=frandPtr==frandArray.length-1?0:frandPtr+1;
	return frandArray[frandPtr];
}
ifrand = function(max) {
	if (max) {return ~~(frand()*max);}
	else {return ~~(frand());}
}