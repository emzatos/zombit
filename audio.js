var sndGun1,sndGun2,sndGun3;
var sndTrack1,sndTrack2,sndTrack3;

var playlist;
var playlistIndex = 0;

function loadAudio() {
	sndDie = loadSoundFile("res/sound/die",2);
	sndHit = loadSoundFile("res/sound/hit",2);
	sndKill = loadSoundFile("res/sound/kill",4);
	sndGun1 = loadSoundFile("res/sound/gun1",4);
	sndGun2 = loadSoundFile("res/sound/gun2",4);
	sndGun3 = loadSoundFile("res/sound/gun3",4);

	sndTrack1 = loadSoundFile("res/sound/moves");
	sndTrack1.volume = 0.2;

	sndTrack2 = loadSoundFile("res/sound/untoldStory");
	sndTrack2.volume = 0.2;

	sndTrack3 = loadSoundFile("res/sound/citySounds");
	sndTrack3.volume = 0.2;

	playlist = [sndTrack1, sndTrack2, sndTrack3];
	for (var i=0; i<playlist.length; i++) {
		playlist[i].addEventListener("ended",playlistNext,false);
	}
}

function loadSoundFile(src,nchannels) {
	console.log("Loading sound: "+src);
	var au = new Audio();

	var source= document.createElement('source');
	if (au.canPlayType('audio/mpeg;')) {
	    source.type= 'audio/mpeg';
	    source.src= src+'.mp3';
	} else {
	    source.type= 'audio/ogg';
	    source.src= src+'.ogg';
	}
	au.appendChild(source);

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
		this.channels[this.cic].currentTime=0;
		this.channels[this.cic].play();
		this.cic = this.cic==this.channels.length-1?0:this.cic+1; //inc ptr
	}
}
Sound.prototype.setVolume = function(vol) {
	this.audio.volume = vol;
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