/**
 * Manages network updates
 * @param mode CLIENT or SERVER
 */
NetworkManager = function(mode) {
	this.mode = mode||CLIENT;
	this.updates = [];
}

/**
 * Transmits all pending updates
 */
NetworkManager.prototype.updateAll = function() {
	for (var i=0, j=this.updates.length; i<j; i++) {
		var up = this.updates[i];
		if (up!=null) {
			this.send(up);
		}
	}
	this.clearAll();
}

/**
 * Transmits a NetworkUpdate
 * @param update a NetworkUpdate to send
 */
NetworkManager.prototype.send = function(update) {
	switch (this.mode) {
		case CLIENT:
			mpSocket.emit(update.type,update.thing);
		break;
		case SERVER:
			update.socket.emit(update.type,update.thing);
		break;
	}
}

NetworkManager.prototype.add = function(update) {
	return this.updates.push(update);
}

NetworkManager.prototype.remove = function(index) {
	this.updates[index] = null;
}

/**
 * Queue a function call update
 * @param entity entity ID
 * @param fn the function to call
 * @param args arguments to pass to the function
 * @param socket the socket to emit from (do not pass in client mode)
 */
NetworkManager.prototype.addFunction = function(entity,fn,args,socket) {
	this.add(new NetworkUpdate("function",
		{
			"entity": entity, 
			"fn": fn, 
			"args": args, 
		},socket));
}

/**
 * Queue a property update
 * @param entity entity ID
 * @param prop the property to update
 * @param val the value to set it to
 * @param socket the socket to emit from (do not pass in client mode)
 */
NetworkManager.prototype.addProperty = function(entity,prop,val,socket) {
	this.add(new NetworkUpdate("property",
		{
			"entity": entity,
			"prop": prop,
			"val": val
		},socket));
}

NetworkManager.prototype.clearAll = function() {
	this.updates = [];
}

/**
 * Represents a network update
 * @param type type of event that will be emitted
 * @param thing the object that will be emitted
 * @param socket the socket to emit on (exclude this to use in client mode)
 */
NetworkUpdate = function(type,thing,socket) {
	this.type = type;
	this.thing = thing;
	if (socket) {
		this.socket = socket;
		this.mode = SERVER;
	}
	else {
		this.socket = null;
		this.mode = CLIENT;
	}
}