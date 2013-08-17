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

function StaticLight(x,y,col,size) {
	this.x = x;
	this.y = y;
	this.col = col;
	this.size = size;
	this.getX = function() {return this.x;}
	this.getY = function() {return this.y;}
}

function EntityLight(entity,col,size) {
	this.entity = entity;
	this.col = col;
	this.size = size;
	this.getX = function() {return this.entity.x;}
	this.getY = function() {return this.entity.y;}
}

function drawLight(context,x,y,col,size) {
	var gr = context.createRadialGradient(x,y,0,x,y,size/2);
	gr.addColorStop(0,col);
	gr.addColorStop(1,"rgba(0,0,0,0)");
	context.fillStyle = gr;
	context.fillRect(Math.floor(x-size/2),Math.floor(y-size/2),size,size);
}

function compositeLight(dest) {
	dest.globalCompositeOperation = "source-over";
	dest.drawImage(lightbuffer,0,0);
	dest.globalCompositeOperation = "source-over";
}

function drawAllLights() {
	for (var i=0; i<lightArray.length; i++) {
		if (lightArray[i]!=null && lightArray[i].col) {
			var x = lightArray[i].getX();
			var y = lightArray[i].getY();
			var s = lightArray[i].size;
			
			if (x+s>=viewX && x-s<=viewX+viewWidth && y+s>=viewY && y-s<=viewY+viewHeight) {
				drawLight(lictx,x-viewX,y-viewY,lightArray[i].col,s);
			}
		}
	}
}

function renderLight() {
	if (enableLightRendering) {
		lictx.globalCompositeOperation = "source-over";
		lictx.fillStyle = "rgba(0,0,0,1)";
		lictx.fillRect(0,0,lightbuffer.width,lightbuffer.height);
		
		//lightbuffer.width = lightbuffer.width;
		
	
		lictx.globalCompositeOperation = "destination-out";
		drawAllLights();
		if (enableLightTinting) {
			lictx.globalCompositeOperation = "source-atop";
			drawAllLights();
		}
		lictx.globalCompositeOperation = "source-over";
	
		compositeLight(ctx);
	}
}

function addLightsToLevel(level,spacing,color,size,randomness,chanceBroken) {
	for (var x=spacing, w=level.getWidth()*tileWidth; x<w; x+=spacing) {
		for (var y=spacing, h=level.getHeight()*tileHeight; y<h; y+=spacing) {
			if (Math.random()>chanceBroken) {registerLight(new StaticLight(x,y,color,size-(Math.random()*size*randomness)));}
		}
	}
}