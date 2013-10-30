/**
 * Manages network updates
 * @param mode CLIENT or SERVER
 */
NetworkManager = function(mode) {
    this.mode = mode || CLIENT;
    this.updates = [];
}

/**
 * Transmits all pending updates
 */
NetworkManager.prototype.updateAll = function() {
    for (var i = 0, j = this.updates.length; i < j; i++) {
        var up = this.updates[i];
        if (up !== null) {
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
            mpSocket.emit(update.type, update.thing);
            break;
        case SERVER:
            update.socket.emit(update.type, update.thing);
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
NetworkManager.prototype.addFunction = function(entity, fn, args, socket) {
    this.add(new NetworkUpdate("function",
            {
                "entity": entity,
                "fn": fn,
                "args": args,
            }, socket));
}

/**
 * Queue a property update
 * @param entity entity ID
 * @param prop the property to update
 * @param val the value to set it to
 * @param socket the socket to emit from (do not pass in client mode)
 */
NetworkManager.prototype.addProperty = function(entity, prop, val, socket) {
    this.add(new NetworkUpdate("property",
            {
                "entity": entity,
                "prop": prop,
                "val": val
            }, socket));
}

NetworkManager.prototype.addProperties = function(entity, props, socket) {
    for (var prop in props) {
        this.add(new NetworkUpdate("property",
                {
                    "entity": entity,
                    "prop": prop,
                    "val": entity[prop]
                }, socket));
    }
}

NetworkManager.prototype.clearAll = function() {
    this.updates = [];
}

/**
 * Watch for updates to properties in an entity and transmit them if they are changed.
 * @param {Object} object to watch
 * @param {String[]} properties to watch
 * @returns {undefined}
 */
networkRegister = function(object, properties) {
    for (var i = 0, j = properties.length; i < j; i++) {
        
        console.log(object[properties[i]]);
        
        if (typeof object[properties[i]] === 'function') {
            object[properties[i]] = (function() {
                var cached = object[properties[i]];
                return function() {
                    cached.apply(this, arguments); // use .apply() to call it
                    
                    //Network update:
                    console.log("function "+arguments[0]+" was called with "+arguments.length+" arguments.");
                };
            }());
        }
        else {
            object.watch(properties[i], function(prop, oldval, newval) {
                //Network update:
                //console.log("property "+prop+" was changed from "+oldval+" to "+newval);
                return newval;
            });
        }
    }
}

/**
 * Represents a network update
 * @param type type of event that will be emitted
 * @param thing the object that will be emitted
 * @param socket the socket to emit on (exclude this to use in client mode)
 */
NetworkUpdate = function(type, thing, socket) {
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