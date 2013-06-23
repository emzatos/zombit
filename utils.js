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

extend = function() {
    var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false,
        toString = Object.prototype.toString,
        hasOwn = Object.prototype.hasOwnProperty,
        push = Array.prototype.push,
        slice = Array.prototype.slice,
        trim = String.prototype.trim,
        indexOf = Array.prototype.indexOf,
        class2type = {
          "[object Boolean]": "boolean",
          "[object Number]": "number",
          "[object String]": "string",
          "[object Function]": "function",
          "[object Array]": "array",
          "[object Date]": "date",
          "[object RegExp]": "regexp",
          "[object Object]": "object"
        },
        jQuery = {
          isFunction: function (obj) {
            return jQuery.type(obj) === "function"
          },
          isArray: Array.isArray ||
          function (obj) {
            return jQuery.type(obj) === "array"
          },
          isWindow: function (obj) {
            return obj != null && obj == obj.window
          },
          isNumeric: function (obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj)
          },
          type: function (obj) {
            return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
          },
          isPlainObject: function (obj) {
            if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
              return false
            }
            try {
              if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false
              }
            } catch (e) {
              return false
            }
            var key;
            for (key in obj) {}
            return key === undefined || hasOwn.call(obj, key)
          }
        };
      if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        i = 2;
      }
      if (typeof target !== "object" && !jQuery.isFunction(target)) {
        target = {}
      }
      if (length === i) {
        target = this;
        --i;
      }
      for (i; i < length; i++) {
        if ((options = arguments[i]) != null) {
          for (name in options) {
            src = target[name];
            copy = options[name];
            if (target === copy) {
              continue
            }
            if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && jQuery.isArray(src) ? src : []
              } else {
                clone = src && jQuery.isPlainObject(src) ? src : {};
              }
              // WARNING: RECURSION
              target[name] = extend(deep, clone, copy);
            } else if (copy !== undefined) {
              target[name] = copy;
            }
          }
        }
      }
      return target;
    }