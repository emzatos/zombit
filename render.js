//viewport settings
viewWidth = 320;
viewHeight = 240;
viewX = 0;
viewY = 0;

//output settings
screenWidth = 640;
screenHeight = 480;

function render() {
  //clear screen
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,viewWidth,viewHeight);

  //render the levels
  drawLevel();

  //apply shaders
  //shader(srand);
  shader(sfx);

  //draw fps
  ctx.fillStyle = "black";
  ctx.fillRect(2,10,60,14);
  ctx.fillStyle = "white";
  ctx.fillText("FPS: "+(~~fps),4,20);
  
	//copy buffer to screen at proper scale
	sctx.drawImage(buffer,0,0,screenWidth,screenHeight);
}

function drawLevel() {
  var w = level.getWidth();
  var h = level.getHeight();

  //loop through portion of level within view
  for (var x=~~(viewX/tileWidth); x<~~((viewX+viewWidth)/tileWidth)+1; x++) {
    for (var y=~~(viewY/tileHeight); y<~~((viewY+viewHeight)/tileHeight)+1; y++) {
      var sx = x*tileWidth-viewX; //pixel x
      var sy = y*tileHeight-viewY; //pixel y

      var tile = level.getTile(x,y); //get the tile at this position

      if (tile!=null) {
        //"color code" for tile.  temporary use until tile sprites added
        var cc = ~~((255/4)*tile.id);
        ctx.fillStyle = "rgb("+cc+","+cc+","+cc+")";
        ctx.fillRect(sx,sy,tileWidth,tileHeight);
        ctx.strokeStyle = "black";
        ctx.strokeRect(sx,sy,tileWidth,tileHeight);
      }
    }
  }
}

//shader function, pass function(data,xPixel,yPixel,RedVal,BlueVal,GreenVal) that returns [r,g,b]
function shader(func) {
  var id = ctx.getImageData(0,0,viewWidth,viewHeight);
  var dat = id.data;
  //var d2 = dat.clone();
  for (var x=1; x<viewWidth-1; x++) {
    for (var y=1; y<viewHeight-1; y++) {
      var r = dat[ri(x,y)];
      var g = dat[bi(x,y)];
      var b = dat[gi(x,y)];
      var result = func(dat,x,y,r,g,b);

      dat[ri(x,y)]=result[0];
      dat[gi(x,y)]=result[1];
      dat[bi(x,y)]=result[2];
    }
  }
  ctx.putImageData(id,0,0);
}

//color indexes
function ri(x,y) {return ((x)+(y)*viewWidth)*4+0;}
function gi(x,y) {return ((x)+(y)*viewWidth)*4+1;}
function bi(x,y) {return ((x)+(y)*viewWidth)*4+2;}
function ai(x,y) {return ((x)+(y)*viewWidth)*4+3;}
//function ri(x,y) {return ((x<0?0:x>viewWidth?viewWidth:x)+(y<0?0:y>viewHeight?viewHeight:y)*viewWidth)*4+0;}
//function gi(x,y) {return ((x<0?0:x>viewWidth?viewWidth:x)+(y<0?0:y>viewHeight?viewHeight:y)*viewWidth)*4+1;}
//function bi(x,y) {return ((x<0?0:x>viewWidth?viewWidth:x)+(y<0?0:y>viewHeight?viewHeight:y)*viewWidth)*4+2;}
//function ai(x,y) {return ((x<0?0:x>viewWidth?viewWidth:x)+(y<0?0:y>viewHeight?viewHeight:y)*viewWidth)*4+3;}

function sthresh(d,x,y,r,g,b) { //threshold
  var res = [0,0,0];
  res[0] = r>127?255:0;
  res[1] = g>127?255:0;
  res[2] = b>127?255:0;
  return res;
}

function srand(d,x,y,r,g,b) { //noise
  var res = [0,0,0];
  var ra = frand()*255;
  res[0] = ra;
  res[1] = ra;
  res[2] = ra;
  return res;
}

function sfx(d,x,y,r,g,b) { //red channel blur + threshold
  var res = [0,0,0];
  var dm = 0.9+frand()*0.1;
  res[0] = ((d[ri(x-1,y)]+d[ri(x+1,y)])*0.5)*dm;
  res[1] = g*dm;
  res[2] = ((d[bi(x,y-1)]+d[bi(x,y+1)])*0.5)*dm;
  return res;
}

function sblur(d,x,y,r,g,b) { //red channel blur + threshold
  var res = [0,0,0];
  res[0] = (d[ri(x-1,y)]+d[ri(x+1,y)])/2;
  res[1] = g;
  res[2] = (d[bi(x+2,y)]+d[bi(x,y)])/2;
  return res;
}

function strokeEllipse(ctx, x, y, w, h) {
  var kappa = .5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  ctx.closePath();
  ctx.stroke();
}