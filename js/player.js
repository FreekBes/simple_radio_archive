function formatSeconds(seconds) {
	seconds = Number(seconds);
	if (aPlayer.unformattedSeconds === true) {
		return Math.floor(seconds);
	}
	var h = Math.floor(seconds / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);

	var hDisplay = h > 0 ? h + ":" : "";
	var mDisplay = m > 0 ? (m < 10 ? "0" : "") + m + ":" : "00:";
	var sDisplay = s > 0 ? (s < 10 ? "0" : "") + s : "00";
	return hDisplay + mDisplay + sDisplay;
}

var aPlayer = {
	initialized: false,
	cur: -1,
	dir: 1,
	isLive: false,
	schedule: [0, 0],
	startedPlayingAt: 0,
	unformattedSeconds: false,

	init: async function() {
		this.initialized = true;
		this.list = document.getElementsByClassName("ep");
		this.epamount = this.list.length;
		this.times = document.getElementById("player-times");
		this.canvas = document.getElementById("background");

		// create audio and context
		this.audio = new Audio();
		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftsize = 2048;
		this.analyser.smoothingTimeConstant = 0.8;
		this.source = this.audioContext.createMediaElementSource(this.audio);

		// create filters
		this.filter = this.audioContext.createBiquadFilter();
		this.filter.type = "lowpass";
		this.filter.frequency.value = 32;
		this.gainNode = this.audioContext.createGain();
		this.gainNode.gain.value = 1;

		// add the beat detection worker
		try {
			await this.audioContext.audioWorklet.addModule("js/lib/workers/beatdetection.js");
			this.beatDetectionNode = new AudioWorkletNode(this.audioContext, "beatdetection", {
				processorOptions: {
					someUsefulVariable: new Map([
						[1, "one"],
						[2, "two"]
					])
				}
			});
			console.log("Beat detection node set up");
		}
		catch (err) {
			console.error("Error setting up beat detection node: " + err);
		}

		// connect all Web Audio API elements together
		this.source.connect(this.filter);
		this.filter.connect(this.gainNode);
		this.gainNode.connect(this.analyser);
		this.source.connect(this.beatDetectionNode);
		this.source.connect(this.audioContext.destination);
		// this.beatDetectionNode.connect(this.audioContext.destination);
		// this.gainNode.connect(this.audioContext.destination);

		// set up action handlers for media session (lock screen controls)
		if ('mediaSession' in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata({});
			navigator.mediaSession.setActionHandler('play', this.play);
			navigator.mediaSession.setActionHandler('pause', this.pause);
			navigator.mediaSession.setActionHandler('nexttrack', this.next);
			navigator.mediaSession.setActionHandler('previoustrack', this.previous);
			navigator.mediaSession.playbackState = "none";
		}

		// update UI elements every half a second
		setInterval(function() {
			if (!progressBar.hovering && aPlayer.cur != -1) {
				var ct = aPlayer.getCurrentTime();
				var dur = aPlayer.getDuration();
				if (dur) {
					if (dur != Infinity) {
						progressBar.setValue(ct / dur * 100);
					}
					aPlayer.updateTimes(ct, dur);
				}
				else {
					aPlayer.times.innerHTML = "";
				}
				tlHandler.handle(ct);
			}
			if (aPlayer.cur > -1 && aPlayer.audio.buffered.length > 0) {
				progressBar.setValueBuffer(aPlayer.audio.buffered.end(aPlayer.audio.buffered.length-1) / aPlayer.audio.duration * 100);
			}
			else {
				progressBar.setValueBuffer(0);
			}
			var curTimestamp = Math.floor(new Date().getTime() / 1000);
			if (aPlayer.cur == -2 && (curTimestamp < aPlayer.schedule[0] || aPlayer.getCurrentTime() > aPlayer.getDuration())) {
				window.location.reload();
			}
		}, 500);

		// add audio event listeners
		this.audio.addEventListener("ended", function(event) {
			console.log("Episode ended, skipping to next...");
			aPlayer.next();
		});

		// set up visualizer handler
		this.visualizer = new Visualizer(this.canvas, this.audioContext, this.analyser);

		// load basic visualizer
		const basicVisualizer = new BasicVisualizer();
		this.visualizer.setTheme(basicVisualizer);
		// const vis = new BluetoothVisualizer();
		// this.visualizer.setTheme(vis);
	},


	open: function(num) {
		if (!aPlayer.initialized) {
			aPlayer.init();
		}

		var audioSrc = aPlayer.list[num].href;
		var mdTitle = aPlayer.list[num].getAttribute("data-epname");
		var mdShow = aPlayer.list[num].getAttribute("data-show");
		var mdArtwork = aPlayer.list[num].getAttribute("data-art");
		var mdArtworkSize = aPlayer.list[num].getAttribute("data-artsize");
		var mdDate = aPlayer.list[num].getAttribute("data-date");
		var mdTracklist = aPlayer.list[num].getAttribute("data-tracklist");

		document.getElementById("play-pause").innerHTML = "play_circle_outline";
		aPlayer.times.innerHTML = "";
		aPlayer.startedPlayingAt = Math.floor(new Date().getTime() / 1000);

		progressBar.setValue(0);
		progressBar.setValueBuffer(0);
		tlHandler.lastPlayIndex = -1;
		tlHandler.beenPlayingFor = 0;
		scrobbler.nowPlayingUpdated = false;
		document.getElementById("player-art").src = mdArtwork;
		document.getElementById("player-title").innerHTML = mdTitle;
		document.getElementById("player-show").innerHTML = mdShow;
		if ('mediaSession' in navigator) {
			navigator.mediaSession.playbackState = "none";
			navigator.mediaSession.metadata = new MediaMetadata({
				title: mdTitle,
				artist: mdShow,
				album: mdShow + " " + mdTitle,
				artwork: [
					{
						sizes: mdArtworkSize,
						src: mdArtwork,
						type: "image/jpeg"
					}
				]
			});
			navigator.mediaSession.setActionHandler('seekto', function(details) {
				if (!details.fastSeek)
					aPlayer.seekTo(details.seekTime);
			});
			navigator.mediaSession.setActionHandler('seekbackward', this.skipBack);
			navigator.mediaSession.setActionHandler('seekforward', this.skipForward);
		}

		document.getElementById("player-extra").innerHTML = "Broadcasted on " + mdDate;
		if (mdTracklist != "null") {
			tlHandler.enable(mdTracklist);
		}
		else {
			tlHandler.disable();
		}

		document.getElementsByTagName("footer")[0].style.bottom = "0px";

		aPlayer.cur = num;
		aPlayer.audio.innerHTML = ''; // remove all sources
		var srcElem = document.createElement("source");
		srcElem.setAttribute("type", "audio/"+audioSrc.split(".").pop());
		srcElem.setAttribute("src", audioSrc);
		aPlayer.audio.append(srcElem);
		aPlayer.audio.load();
		aPlayer.play();
	},

	openLive: function(elem) {
		if (!aPlayer.initialized) {
			aPlayer.init();
		}

		var sources = [];
		try { sources = JSON.parse(elem.getAttribute("data-streams")); }
		catch (e) { console.warn("Unable to parse data-streams from live episode"); }
		var mdTitle = elem.getAttribute("data-epname");
		var mdRadio = elem.getAttribute("data-radio");
		var mdShow = elem.getAttribute("data-show");
		var mdArtwork = elem.getAttribute("data-art");
		var mdArtworkSize = elem.getAttribute("data-artsize");

		document.getElementById("play-pause").innerHTML = "play_circle_outline";
		aPlayer.times.innerHTML = "";
		aPlayer.schedule = elem.getAttribute("data-schedule").split("/");
		aPlayer.schedule[0] = parseInt(aPlayer.schedule[0]);
		aPlayer.schedule[1] = parseInt(aPlayer.schedule[1]);
		aPlayer.startedPlayingAt = Math.floor(new Date().getTime() / 1000);

		progressBar.setValue(0);
		progressBar.setValueBuffer(0);
		tlHandler.lastPlayIndex = -1;
		tlHandler.beenPlayingFor = 0;
		scrobbler.nowPlayingUpdated = false;
		document.getElementById("player-art").src = mdArtwork;
		document.getElementById("player-title").innerHTML = mdTitle;
		document.getElementById("player-show").innerHTML = mdShow;
		if ('mediaSession' in navigator) {
			navigator.mediaSession.playbackState = "none";
			navigator.mediaSession.metadata = new MediaMetadata({
				title: mdTitle,
				artist: mdShow,
				album: mdShow + " " + mdTitle,
				artwork: [
					{
						sizes: mdArtworkSize,
						src: mdArtwork,
						type: "image/jpeg"
					}
				]
			});
			navigator.mediaSession.setActionHandler('seekto', null);
			navigator.mediaSession.setActionHandler('seekbackward', null);
			navigator.mediaSession.setActionHandler('seekforward', null);
		}

		document.getElementById("player-extra").innerHTML = "Live <i>right now</i> on " + mdRadio;

		document.getElementsByTagName("footer")[0].style.bottom = "0px";

		aPlayer.cur = -2;
		aPlayer.audio.innerHTML = ''; // remove all sources
		sources.forEach(function(source) {
			if (aPlayer.audio.canPlayType(source["type"]) == "probably") {
				var srcElem = document.createElement("source");
				srcElem.setAttribute("type", source["type"]);
				srcElem.setAttribute("src", source["url"]);
				aPlayer.audio.append(srcElem);
			}
		});
		aPlayer.audio.load();
		aPlayer.play();
	},

	togglePlayPause: function() {
		if (aPlayer.cur == -1) {
			return aPlayer.open(0, false);
		}
		if (aPlayer.audio.paused) {
			return aPlayer.play();
		}
		return aPlayer.pause();
	},

	play: function() {
		if (aPlayer.cur == -1) {
			return aPlayer.open(0, false);
		}
		if (aPlayer.audio.paused) {
			aPlayer.audio.play();
			document.getElementById("play-pause").innerHTML = "pause_circle_outline";
			if ('mediaSession' in navigator) {
				navigator.mediaSession.playbackState = "playing";
			}
		}
	},

	pause: function() {
		if (!aPlayer.audio.paused) {
			aPlayer.audio.pause();
			document.getElementById("play-pause").innerHTML = "play_circle_outline";
			if ('mediaSession' in navigator) {
				navigator.mediaSession.playbackState = "paused";
			}
		}
	},

	next: function() {
		if (aPlayer.dir == 1) {
			if (aPlayer.cur > -1 && aPlayer.cur + 1 < aPlayer.epamount) {
				aPlayer.open(aPlayer.cur + 1, false);
			}
			else {
				aPlayer.open(0, false);
			}
		}
		else {
			if (aPlayer.cur > 0) {
				aPlayer.open(aPlayer.cur - 1, false);
			}
			else {
				aPlayer.open(aPlayer.epamount - 1, false);
			}
		}
	},

	previous: function() {
		if (aPlayer.dir == 1) {
			if (aPlayer.cur > 0) {
				aPlayer.open(aPlayer.cur - 1, false);
			}
			else {
				aPlayer.open(aPlayer.epamount - 1, false);
			}
		}
		else {
			if (aPlayer.cur > -1 && aPlayer.cur + 1 < aPlayer.epamount) {
				aPlayer.open(aPlayer.cur + 1, false);
			}
			else {
				aPlayer.open(0, false);
			}
		}
	},

	getDuration: function() {
		if (aPlayer.cur != -2) {
			return Math.floor(aPlayer.audio.duration);
		}
		else {
			return aPlayer.schedule[1] - aPlayer.schedule[0];
		}
	},

	getCurrentTime: function() {
		if (aPlayer.cur != -2) {
			return Math.floor(aPlayer.audio.currentTime);
		}
		else {
			return aPlayer.startedPlayingAt + aPlayer.audio.currentTime - aPlayer.schedule[0];
		}
	},

	updateTimes: function(time, dur) {
		if (dur != Infinity) {
			aPlayer.times.innerHTML = formatSeconds(time) + " / " + formatSeconds(dur);
		}
		else {
			var tempDate = new Date();
			aPlayer.times.innerHTML = tempDate.getHours() + ":" + ("0" + tempDate.getMinutes()).slice(-2) + ":" + ("0" + tempDate.getSeconds()).slice(-2);
		}
	},

	seekTo: function(time) {
		aPlayer.audio.currentTime = time;
		tlHandler.handle(time);
	},

	skipBack: function() {
		var curTime = aPlayer.getCurrentTime();

		if (curTime > 10) {
			aPlayer.seekTo(curTime - 10);
		}
	},

	skipForward: function() {
		var curTime = aPlayer.getCurrentTime();

		if (curTime < aPlayer.getDuration() - 11) {
			aPlayer.seekTo(curTime + 10);
		}
	},

	volumeUp: function() {
		if (aPlayer.audio.volume < 0.9) {
			aPlayer.audio.volume += 0.1;
		}
		else {
			aPlayer.audio.volume = 1;
		}
	},

	volumeDown: function() {
		if (aPlayer.audio.volume > 0.1) {
			aPlayer.audio.volume -= 0.1;
		}
		else {
			aPlayer.audio.volume = 0;
		}
	},

	setVolume: function(vol) {
		aPlayer.audio.volume = vol;
	},

	mute: function() {
		if (aPlayer.audio.muted || aPlayer.audio.volume == 0) {
			aPlayer.audio.muted = false;
		}
		if (aPlayer.audio.volume < 0.1) {
			aPlayer.audio.volume = 0.1;
		}
		else {
			aPlayer.audio.muted = true;
		}
	}
};
