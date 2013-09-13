//Portion of initialization code shared between client and server

function startGame() {
	//generate gameLevel
	gameLevel = generateRectRooms(120,120,16);
	//gameLevel = generateNoise(120,120,[WALL,FLOOR]);
	gameLevel = generatePlants(gameLevel,0.1);
	gameLevel = punchOutWalls(gameLevel,0.1);
	
	//populate the level with light fixtures
	addLightsToLevel(gameLevel,196,"rgb(175,161,152)",512,0.4,0.3,1);

	//spawn some zombies
	for (var i=0; i<15; i++) {
		var tx,ty,ta;
		do {
			tx = Math.round(Math.random()*(gameLevel.getWidth()-2))+1;
			ty = Math.round(Math.random()*(gameLevel.getHeight()-2))+1;
			ta = tileAt(tx,ty);
			if (ta!=null && ta.id==FLOOR) {break;}
		} while (true);
		new Zombie(tx*tileWidth+tileWidth/2, ty*tileHeight+tileHeight/2, 80);
	}

	//tell zombies to spawn continuously
	setInterval(function(){
		if (entities.length<50) {
		for (var i=0; i<1; i++) {
			var tx,ty,ta;
			do {
				tx = Math.round(Math.random()*(gameLevel.getWidth()-2))+1;
				ty = Math.round(Math.random()*(gameLevel.getHeight()-2))+1;
				ta = tileAt(tx,ty);
				if (ta!=null && ta.id==FLOOR) {break;}
			} while (true);
			new Zombie(tx*tileWidth+tileWidth/2, ty*tileHeight+tileHeight/2, 80);
		}}
	},500);

	//set up some light
	registerLight(new EntityLight(player,"rgba(200,150,110,0.5)",200,1));

	//start music
	//setTimeout(startPlaylist,4900);

	//switch to game rendering mode in 5 sec
	setTimeout(function(){dmode=GAME;},5000);

	//set interval for processing
	timer = setInterval(step,1000/targetFPS);
}

function processStep() {
	//process entities
	for (var ec in entities) {
		var ent = entities[ec];
		if (ent instanceof Entity) {ent.step(tdelta);}
	}

	//process particles
	for (var ec = 0; ec<particles.length; ec++) {
    	var prt = particles[ec];
		if (prt instanceof Particle) {prt.step(tdelta);}
	}

	//process items (gun timers, etc)
	for (var ic = 0; ic<items.length; ic++) {
    	ite = items[ic];
		if (ite instanceof Item) {ite.step(tdelta);}
	}
}