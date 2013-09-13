var lightArray = [];
var lightbuffer, lictx;

function initLight() {
	lightbuffer = document.createElement("canvas");
	lightbuffer.width = viewWidth;
	lightbuffer.height = viewHeight;
	lictx = lightbuffer.getContext("2d");
}

function registerLight(light) {
	if (lightArray.indexOf(light)<0) {
		lightArray.push(light);
	}
}

function unregisterLight(light) {
	var i = lightArray.indexOf(light);
	if (i>=0) {lightArray[i] = null;}
}

function StaticLight(x,y,col,size,brightness) {
	this.x = x;
	this.y = y;
	this.col = col;
	this.size = size;
	this.brightness = brightness;
	this.getX = function() {return this.x;}
	this.getY = function() {return this.y;}
}

function EntityLight(entity,col,size,brightness) {
	this.entity = entity;
	this.col = col;
	this.size = size;
	this.brightness = brightness;
	this.getX = function() {return this.entity.x;}
	this.getY = function() {return this.entity.y;}
}

function drawLight(context,x,y,col,size,brightness,doGlare) {
	var gr = context.createRadialGradient(x,y,0,x,y,size/2);
	gr.addColorStop(0,col);
	gr.addColorStop(1,"rgba(0,0,0,0)");
	context.fillStyle = gr;
	context.globalAlpha = brightness>1?1:brightness;
	context.fillRect(Math.floor(x-size/2),Math.floor(y-size/2),size,size);
	if (enableGlare && doGlare && brightness>0.6) { //glare (brightness can go up to 2)
		var sm = 1-(fsin(Date.now()*0.05)*0.05);
		ctx.globalAlpha = brightness>2?1*sm:(brightness-0.5)*0.15*sm;
		//console.log("glaring "+ctx.globalAlpha);
		ctx.drawImage(imgGlare,x-(imgGlare.width*0.5*((size*2)/imgGlare.width)*sm),y-(imgGlare.height*0.5*((size*2)/imgGlare.height)*sm),size*2*sm,size*2*sm);
	}
	context.globalAlpha = 1;
}

function compositeLight(dest,gco) {
	dest.globalCompositeOperation = gco;
	dest.drawImage(lightbuffer,0,0);
	dest.globalCompositeOperation = "source-over";
}

function drawAllLights(gbrightness,doGlare) {
	if (doGlare) {ctx.globalCompositeOperation = "lighter";}
	for (var i=0; i<lightArray.length; i++) {
		if (lightArray[i]!=null && lightArray[i].col) {
			var x = lightArray[i].getX();
			var y = lightArray[i].getY();
			var s = lightArray[i].size;
			
			if (x+s>=viewX && x-s<=viewX+viewWidth && y+s>=viewY && y-s<=viewY+viewHeight) {
				//console.log(lightArray[i].brightness);
				drawLight(lictx,x-viewX,y-viewY,lightArray[i].col,s,lightArray[i].brightness*gbrightness,doGlare);
			}
		}
	}
	if (doGlare) {ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;}
}

function renderLight() {
	if (enableLightRendering) {
		lictx.globalCompositeOperation = "source-over";
		lictx.fillStyle = "rgba(0,0,0,1)";
		lictx.fillRect(0,0,lightbuffer.width,lightbuffer.height);

		lictx.globalCompositeOperation = "destination-out";
		drawAllLights();
		drawAllLights();
		compositeLight(ctx,"source-over");

		if (enableLightTinting) {
			//lightbuffer.width = lightbuffer.width;
			lictx.globalCompositeOperation = "source-atop";//"source-atop";
			drawAllLights(1,false);
			compositeLight(ctx,"source-over");

			lictx.globalCompositeOperation = "source-over";
			lictx.fillStyle = "rgba(0,0,0,1)";
			lictx.fillRect(0,0,lightbuffer.width,lightbuffer.height);
			
			lictx.globalCompositeOperation = "lighter";//"source-atop";
			drawAllLights(0.6,true);
			compositeLight(ctx,"lighter");
			//compositeLight(ctx,"darker");
		}

		lictx.globalCompositeOperation = "source-over";
	}
}

function addLightsToLevel(level,spacing,color,size,randomness,chanceBroken,brightness) {
	for (var x=spacing, w=level.getWidth()*tileWidth; x<w; x+=spacing) {
		for (var y=spacing, h=level.getHeight()*tileHeight; y<h; y+=spacing) {
			if (Math.random()>chanceBroken) {registerLight(new StaticLight(x,y,color,size-(Math.random()*size*randomness),brightness));}
		}
	}
}