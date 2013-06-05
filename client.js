mpServer="localhost";
mpPort=1337;
mpReady=false;
mpActive=false;
mpConnected=false;

function mpStart(server, port) {
	mpActive = true;
	if (!server) {server=mpServer;}
	if (!port) {port=mpPort;}
	
	mpServer = server;
	mpPort = port;
	loadScript("http://"+server+":"+port+"/socket.io/socket.io.js",mpConnect);
}

function mpConnect() {
	var socket = io.connect("http://"+mpServer+":"+mpPort);
	
	socket.on("connect", function(data) {
		mpConnected=true;
		socket.emit("setnick", "MyUsername");
	});

	socket.on("ready", function() {
		mpReady = true;
	});
	
	socket.on("info", function(data) {
		if (data.display) {
			//TODO: Print to chat
			console.log(data.text);
		}
	});
	
	socket.on("chunk", function(chunk) {
		console.log(chunk);
		gameLevel.chunkSet(chunk);
	});
	
	socket.on("kick", function(data) {
		//TODO: Print to chat
		console.log("Kicked: "+data.reason);
	});

	socket.on("disconnect", function() {
		mpActive = false;
		mpReady = false;
		mpConnected = false;
	});
}

function loadScript(url, callback){

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}