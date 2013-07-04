//viewport settings
var viewWidth = 600;
var viewHeight = 400;
var viewX = 0;
var viewY = 0;

//output settings
var screenWidth = 1200;
var screenHeight = 800;
var defaultScreenWidth = screenWidth;
var defaultScreenHeight = screenHeight;

var INTRO=0,GAME=1;
var dmode = INTRO;
var intime = null;
var showFPS = true;

//advanced shader data
var od,out;

//particles
var particles = new Array();

var renderLocked = false;
function render() {
  if (!renderLocked) {
	renderLocked = true;
	if (dmode==GAME) {
		//clear screen
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,viewWidth,viewHeight);

		ctx.font = '12px "uni"';

		//render the tiles
		drawgameLevel(0);
		drawgameLevel(1);

		//render particles (they're entities, but they must be drawn below the others)
		for (var ec = 0; ec<particles.length; ec++) {
		  var prt = particles[ec];
		  if (prt instanceof Particle) {
			if (prt.x>viewX && prt.x<viewX+viewWidth && prt.y>viewY && prt.y<viewY+viewHeight) {
			  prt.render(prt.x-viewX,prt.y-viewY);
			}
		  }
		}

		//render the entities
		for (var ec = 0; ec<entities.length; ec++) {
		  var ent = entities[ec];
		  if (ent instanceof Entity) {
			if (ent.x>viewX && ent.x<viewX+viewWidth && ent.y>viewY && ent.y<viewY+viewHeight) {
			  ent.render(ent.x-viewX,ent.y-viewY);
			}
		  }
		}

		//draw inventory GUI
		ctx.fillStyle = "rgba(234,240,90,0.3)";
		for (var i=0; i<player.inv.size; i++) {
		  var item = player.inv.get(i);
		  if (item!=null) {
		  ctx.strokeStyle = i==player.inv.selected?"white":"rgba(244,250,60,0.6)";

		  var bx = viewWidth-92-(18*(player.inv.size-i));
		  ctx.fillRect(bx,4,16,16);
		  ctx.strokeRect(bx,4,16,16);
		  if (item.icon) {
			ctx.drawImage(item.icon, bx, 4);
		  }
			
		  // fill row with weapon icons
		  //ctx.drawImage(pistolIcon, viewWidth-92-(18*(player.inv.size-0)), 4);
		  //ctx.drawImage(assultIcon, viewWidth-92-(18*(player.inv.size-1)), 4);
		  //ctx.drawImage(typhoonIcon, viewWidth-92-(18*(player.inv.size-2)), 4);
		  //ctx.drawImage(gaussIcon, viewWidth-92-(18*(player.inv.size-3)), 4);
		  //ctx.drawImage(batIcon, viewWidth-92-(18*(player.inv.size-4)), 4);
		  }
		}

		//draw healthbar
		ctx.fillStyle = "rgba(234,20,53,0.5)";
		ctx.fillRect(viewWidth-92-(18*(player.inv.size)),22,18*(player.inv.size),8);
		ctx.fillStyle = "rgba(20,230,53,1)";
		ctx.fillRect(viewWidth-92-(18*(player.inv.size)),22,18*(player.inv.size)*(player.life/100),8);
		ctx.font = '8px "uni"';
		ctx.fillStyle = "white";
		ctx.fillText(player.life,(viewWidth-92-(18*(player.inv.size)*0.5)-5),28);

		//draw selected item GUI
		ctx.fillStyle = "rgba(234,240,90,0.3)";
		ctx.strokeStyle = "rgba(244,250,60,0.6)";
		ctx.fillRect(viewWidth-90,4,80,25);
		ctx.strokeRect(viewWidth-90,4,80,25);

		ctx.fillStyle = "rgba(255,255,255,1)";
		var ii = player.inv.getSelected();
		ctx.font = '9px "uni"';
		ctx.fillText(ii.name,viewWidth-80,13);

		ctx.font = '12px "uni"';
		if (ii instanceof Gun) {
		  ctx.fillStyle=ii.ammo!=0 && ii.ammo!="R"?"white":"red";
		  ctx.fillText("A: "+ii.ammo,viewWidth-80,25);
		}

		//draw score
		ctx.fillStyle = "rgba(234,240,90,0.3)";
		ctx.strokeStyle = "rgba(244,250,60,0.6)";
		ctx.fillRect(viewWidth/2-40,4,80,20);
		ctx.strokeRect(viewWidth/2-40,4,80,20);

		ctx.font = '13px "uni"';
		ctx.textAlign = 'center';
		ctx.fillStyle = "white";
		ctx.fillText(gameScore,viewWidth/2,18);
		ctx.textAlign = 'left';

		//ctx.fillText("x: "+(lDirX(10,player.facing)).toFixed(5)+", y: "+(lDirY(10,player.facing)).toFixed(5),60,20);

		//draw overlay
		ctx.drawImage(imgOverlay,0,0,viewWidth,viewHeight);

		//apply shaders
		//shader(srand);
		if (enableShaders==true) {xshader(xsfx);}

		//draw fps
		if (showFPS) {
		  ctx.font = '10px monospace';
		  //ctx.fillStyle = "rgba(0,0,0,0.2)";
		  //ctx.fillRect(2,10,40,4);
		  ctx.fillStyle = "white";
		  ctx.fillText("FPS: "+(~~fps),4,12);
		  ctx.fillText("Delta: "+(tdelta.toFixed(1)),4,24);
		}

		//draw chat overlay
		if (mpChatOpen) {
		  ctx.fillStyle = "rgba(0,0,0,0.7)";
		  ctx.fillRect(8,viewHeight-24,viewWidth-16,16);

		  ctx.font = '14px "uni"';
		  ctx.fillStyle = "white";
		  ctx.fillText(mpTypedChat,10,viewHeight-12);
		}

		//draw chat messages
		if (mpChatOpen || new Date().getTime()-mpLastMessageTime<mpMessageFadeTime) {
		  var msgOpacity = mpChatOpen?1:1-(new Date().getTime()-mpLastMessageTime)/mpMessageFadeTime;
		  ctx.fillStyle = "rgba(255,255,255,"+msgOpacity.toFixed(2)+")";
		  ctx.font = '8px "uni"';
		  for (var i=0; i<mpMessages.length; i++) {
			ctx.fillText(mpMessages[i],8,viewHeight-28-10*i);
		  }
		}

		//draw multiplayer overlay
		if (mpActive && !mpReady) {
		  ctx.fillStyle = "rgba(0,0,0,0.5)";
		  ctx.fillRect(0,0,viewWidth,viewHeight);

		  ctx.fillRect(0,viewHeight/2-24,viewWidth,48);
		  var txt = mpConnected?"Loading level...":"Connecting...";

		  ctx.font = '24px "uni"';
		  ctx.textAlign = 'center';
		  ctx.fillStyle = "white";
		  ctx.fillText(txt,viewWidth/2,viewHeight/2);
		  ctx.textAlign = 'left';
		}

		//draw mouse
		ctx.drawImage(imgCursor,mouseX-imgCursor.width/2,mouseY-imgCursor.height/2);
	  }
	  else if (dmode==INTRO) {
		if (intime==null) {intime=new Date().getTime();}
		var delta = new Date().getTime()-intime;

		//clear screen
		ctx.fillStyle = "rgb(40,36,38)";
		ctx.fillRect(0,0,viewWidth,viewHeight);

		ctx.font = '12px "uni"';
		ctx.textAlign = 'center';
		ctx.fillStyle = "white";

		var vpos = viewHeight/2-100;

		ctx.font = '40px "uni"';
		ctx.fillText("Zombit",viewWidth/2,30+vpos);

		if (delta>750) {
		ctx.fillStyle = "lightgray";
		ctx.font = '13px "uni"';
		ctx.fillText("Programming & Design by",viewWidth/2,70+vpos);
		ctx.fillStyle = "white";
		ctx.font = '22px "uni"';
		ctx.fillText("Nondefault",viewWidth/2,90+vpos);
		}

		if (delta>1500) {
		ctx.fillStyle = "lightgray";
		ctx.font = '13px "uni"';
		ctx.fillText("Graphics & Additional Programming by",viewWidth/2,110+vpos);
		ctx.fillStyle = "white";
		ctx.font = '22px "uni"';
		ctx.fillText("Sachittome",viewWidth/2,130+vpos);
		}

		if (delta>2250) {
		ctx.fillStyle = "lightgray";
		ctx.font = '9px "uni"';
		ctx.fillText("Music by",viewWidth/2,150+vpos);
		ctx.fillStyle = "white";
		ctx.font = '15px "uni"';
		ctx.fillText("Sycamore Drive",viewWidth/2,165+vpos);
		ctx.font = '12px "uni"';
		ctx.fillText("http://sycamoredrive.co.uk/",viewWidth/2,180+vpos);
		}

		ctx.textAlign = 'left';
	  }
  
	//copy buffer to screen at proper scale
	sctx.drawImage(buffer,0,0,screenWidth,screenHeight);
	
	renderLocked = false;
	
	//request another frame
	requestAnimFrame(render);
  }
}

function drawgameLevel(mode) {
  var w = gameLevel.getWidth();
  var h = gameLevel.getHeight();

  //loop through portion of gameLevel within view
  for (var x=~~(viewX/tileWidth); x<~~((viewX+viewWidth)/tileWidth)+1; x++) {
    for (var y=~~(viewY/tileHeight); y<~~((viewY+viewHeight)/tileHeight)+1; y++) {
      var sx = x*tileWidth-viewX; //pixel x
      var sy = y*tileHeight-viewY; //pixel y

	  if (!mode || mode==0) { //normal rendering
		  var tile = gameLevel.getTile(x,y); //get the tile at this position

		  if (tile!=null) {
			var tid = tile.id;
			if (tid!=null) {ctx.drawImage(tileImage(tid), sx, sy);}
			//"color code" for tile.  temporary use until tile sprites added
			//var cc = ~~((255/4)*tile.id);
			//ctx.fillStyle = "rgb("+cc+","+cc+","+cc+")";
			//ctx.fillRect(sx,sy,tileWidth,tileHeight);
			//ctx.strokeStyle = "black";
			//ctx.strokeRect(sx,sy,tileWidth,tileHeight);
		  }
	  }
	  else if (mode==1) { //border rendering
		var tile = gameLevel.getTile(x,y); //get the tile at this position
		if (tile.solid) {
			var tl = gameLevel.getTile(x-1,y);
			var tt = gameLevel.getTile(x,y-1);
			var tr = gameLevel.getTile(x+1,y);
			var tb = gameLevel.getTile(x,y+1);
			
			var offset = (imgBorderTop.width-tileWidth)/2;
			if (tl && tl.id != tile.id) {ctx.drawImage(imgBorderLeft, sx-offset, sy-offset);}
			if (tt && tt.id != tile.id) {ctx.drawImage(imgBorderTop, sx-offset, sy-offset);}
			if (tr && tr.id != tile.id) {ctx.drawImage(imgBorderRight, sx-offset, sy-offset);}
			if (tb && tb.id != tile.id) {ctx.drawImage(imgBorderBottom, sx-offset, sy-offset);}
		}
	  }
	  else if (mode==2) { //shadow rendering
		var tile = gameLevel.getTile(x,y); //get the tile at this position
		if (tile.solid) {
			var tl = gameLevel.getTile(x-1,y);
			var tt = gameLevel.getTile(x,y-1);
			var tr = gameLevel.getTile(x+1,y);
			var tb = gameLevel.getTile(x,y+1);
			
			var offset = (imgBlockShadow.width-tileWidth)/2;
			if (tl.id != tile.id || tt.id != tile.id || tr.id != tile.id || tb.id != tile.id) {ctx.drawImage(imgBlockShadow, sx-offset, sy-offset);}
		}
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
      var cr = dat[ri(x,y)];
      var cg = dat[gi(x,y)];
      var cb = dat[bi(x,y)];
      var result = func(dat,x,y,cr,cg,cb);

      dat[ri(x,y)]=result[0];
      dat[gi(x,y)]=result[1];
      dat[bi(x,y)]=result[2];
    }
  }
  ctx.putImageData(id,0,0);
}

function xshader(func) {
  var id = ctx.getImageData(0,0,viewWidth,viewHeight);
  var dat = id.data;

  //var d2 = dat.clone();
  for (var x=1; x<viewWidth-1; x++) {
    for (var y=1; y<viewHeight-1; y++) {
      var cr = dat[ri(x,y)];
      var cg = dat[gi(x,y)];
      var cb = dat[bi(x,y)];
      var result = func(dat,x,y,cr,cg,cb);

      dout[ri(x,y)]=result[0];
      dout[gi(x,y)]=result[1];
      dout[bi(x,y)]=result[2];
    }
  }
  ctx.putImageData(oid,0,0);
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
  var dm = 0.8+frand()*0.2*((0.8*Math.abs((viewHeight*0.5)-y)/(viewHeight*0.5))+0.2);
  res[0] = colLevel(r,20,237)*dm;
  res[1] = colLevel(g,38,202)*dm;
  res[2] = colLevel(b,9,240)*dm;
  return res;
}

function xsfx(d,x,y,r,g,b) { //red channel blur + threshold
  var res = [0,0,0];
  var dm = 0.8+frand()*0.2*((0.8*Math.abs((viewHeight*0.5)-y)/(viewHeight*0.5))+0.2);
  res[0] = colLevel(r,13,202)*dm;
  res[1] = colLevel(g,5,232)*dm;
  res[2] = colLevel(b,10,200)*dm;
  return res;
}

function colLevel(col,min,max) {
  return (col/255)*max+min;
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