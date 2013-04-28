var sndGun1,sndGun2,sndGun3;
var sndTrack1,sndTrack2,sndTrack3;

var playlist;
var playlistIndex = 0;

function loadAudio() {
	sndDie = loadSoundFile("res/die.wav");
	sndHit = loadSoundFile("res/hit.wav",4);
	sndKill = loadSoundFile("res/kill.wav",4);
	sndGun1 = loadSoundFile("res/gun1.wav",4);
	sndGun2 = loadSoundFile("res/gun2.wav",8);
	sndGun3 = loadSoundFile("res/gun3.wav",16);

	sndTrack1 = loadSoundFile("res/moves.mp3");
	sndTrack1.volume = 0.2;

	sndTrack2 = loadSoundFile("res/untoldStory.mp3");
	sndTrack2.volume = 0.2;

	sndTrack3 = loadSoundFile("res/citySounds.mp3");
	sndTrack3.volume = 0.2;

	playlist = [sndTrack1, sndTrack2, sndTrack3];
	for (var i=0; i<playlist.length; i++) {
		playlist[i].addEventListener("ended",playlistNext,false);
	}
}

function loadSoundFile(src,nchannels) {
	console.log("Loading sound: "+src);
	var au = new Audio(src);
	au.load();
	document.body.appendChild(au);

	if (nchannels>1) {
		var temp = new Sound(au,nchannels);
		return temp;
	}
	else {
		return au;
	}
}

function Sound(audioObj,channels) {
	this.audio = audioObj;
	this.nchannels = channels;
	this.channels = new Array();

	for( var i = 0; i < this.nchannels; i++ ) {
        this.channels.push( this.audio.cloneNode(true) );
    }

	/*this.audio.addEventListener( 'load', function(ev){
	    for( var i = 0; i < this.nchannels; i++ ) {
	        this.channels.push( this.audio.cloneNode(true) );
	    }
	}, false );*/

	this.cic = 0; //channel index counter
}
Sound.prototype.play = function(){
	if (this.channels.length>0) {
		this.channels[this.cic].play();
		this.cic = this.cic==this.channels.length-1?0:this.cic+1; //inc ptr
	}
}

function startPlaylist() {
	playlist[playlistIndex].currentTime = 0;
	playlist[playlistIndex].play();
}

function pausePlaylist() {
	playlist[playlistIndex].pause();
}

function playlistNext() {
	playlist[playlistIndex].pause();
	playlistIndex = playlistIndex==playlist.length-1?0:playlistIndex+1;

	playlist[playlistIndex].currentTime = 0;
	playlist[playlistIndex].play();
}