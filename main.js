//Portion of initialization code shared between client and server

preload = function() {
	entityManager = new EntityManager();
}

startGame = function() {
	//generate gameLevel
	gameLevel = LevelFactory.makeEmptyRoom(120,120);
	gameLevel = LevelFactory.addRectRooms(gameLevel,16);
	gameLevel = LevelFactory.addPlants(gameLevel,0.1);
	gameLevel = LevelFactory.addDoorways(gameLevel,0.1);
	
	//populate the level with light fixtures
	if (mpMode==CLIENT) {addLightsToLevel(gameLevel,196,"rgb(175,161,152)",512,0.4,0.3,1);}

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
		if (Zombie.count<80) {
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
}

processStep = function(tdelta) {
	if (!gamePaused) {
		//process entities
		for (var ec in entityManager.entities) {
			var ent = entityManager.get(ec);
			if (ent instanceof Entity) {ent.step(tdelta);}
		}

		//process particles
		if (mpMode==CLIENT) {
			for (var ec = 0; ec<particles.length; ec++) {
		    	var prt = particles[ec];
				if (prt instanceof Particle) {prt.step(tdelta);}
			}
		}

		//process items (gun timers, etc)
		for (var ic = 0; ic<items.length; ic++) {
	    	ite = items[ic];
			if (ite instanceof Item) {ite.step(tdelta);}
		}
	}
}