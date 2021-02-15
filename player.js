function formatSeconds(seconds) {
	seconds = Number(seconds);
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
	beat: {
		historyBuffer: [],
		instantEnergy: 0,
		prevTime: 0,
		bpmTable: [],
		bpm: {
			time: 0,
			counter: 0
		},
		sens: 5
	},

	init: function()
	{
		this.initialized = true;
		this.list = document.getElementsByClassName("ep");
		this.epamount = this.list.length;
		this.times = document.getElementById("player-times");
		this.canvas = document.getElementById("background");

		// create audio and context
		this.audio = new Audio();
		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftsize = 256;
		this.beat.MAX_COLLECT_SIZE = 43 * (this.analyser.fftsize / 2);
		this.beat.COLLECT_SIZE = 1;
		this.analyser.smoothingTimeConstant = 0;
		this.bufferLength = this.analyser.frequencyBinCount;
		this.dataArray = new Uint8Array(this.bufferLength);
		this.source = this.audioContext.createMediaElementSource(this.audio);

		// create filters
		this.filter = this.audioContext.createBiquadFilter();
		this.filter.type = "lowpass";
		this.filter.frequency.value = 20;
		this.gainNode = this.audioContext.createGain();
		this.gainNode.gain.value = 1;


		// connect all Web Audio API elements together
		this.source.connect(this.filter);
		this.filter.connect(this.gainNode);
		this.gainNode.connect(this.analyser);
		this.source.connect(this.audioContext.destination);
		//this.gainNode.connect(this.audioContext.destination);

		if ('mediaSession' in navigator)
		{
			navigator.mediaSession.metadata = new MediaMetadata({});
			navigator.mediaSession.setActionHandler('play', this.play);
			navigator.mediaSession.setActionHandler('pause', this.pause);
			navigator.mediaSession.setActionHandler('nexttrack', this.next);
			navigator.mediaSession.setActionHandler('previoustrack', this.previous);
			navigator.mediaSession.playbackState = "none";
		}

		setInterval(function() {
			if (!progressBar.hovering && aPlayer.cur != -1)
			{
				var ct = aPlayer.getCurrentTime();
				var dur = aPlayer.getDuration();
				if (dur)
				{
					if (dur != Infinity)
					{
						progressBar.setValue(ct / dur * 100);
					}
					aPlayer.updateTimes(ct, dur);
				}
				else
				{
					aPlayer.times.innerHTML = "";
				}
			}
			if (aPlayer.cur > -1 && aPlayer.audio.buffered.length > 0)
			{
				progressBar.setValueBuffer(aPlayer.audio.buffered.end(aPlayer.audio.buffered.length-1) / aPlayer.audio.duration * 100);
			}
			else
			{
				progressBar.setValueBuffer(0);
			}
			var curTimestamp = Math.floor(new Date().getTime() / 1000);
			if (aPlayer.cur == -2 && (curTimestamp < aPlayer.schedule[0] || aPlayer.getCurrentTime() > aPlayer.getDuration()))
			{
				window.location.reload();
			}
		}, 500);

		this.audio.addEventListener("ended", function(event) {
			console.log("Episode ended, skipping to next...");
			aPlayer.next();
		});

		this.canvas.setAttribute("width", window.innerWidth);
		this.canvas.setAttribute("height", window.innerHeight);
		this.canvasContext = this.canvas.getContext("2d");
		this.drawVisuals = requestAnimationFrame(this.draw);
	},

	draw: function() {
		aPlayer.analyser.getByteFrequencyData(aPlayer.dataArray);
		var localAverageEnergy = 0;
		var instantCounter = 0;
		var isBeat = false;

		// fill history buffer
		for (var i = 0; i < aPlayer.bufferLength; i++, ++instantCounter) {
			aPlayer.beat.historyBuffer.push(aPlayer.dataArray[i]);
			aPlayer.beat.instantEnergy += aPlayer.dataArray[i];
		}

		if (instantCounter > aPlayer.beat.COLLECT_SIZE - 1 && aPlayer.beat.historyBuffer.length > aPlayer.beat.MAX_COLLECT_SIZE - 1) {
			aPlayer.beat.instantEnergy = aPlayer.beat.instantEnergy / (aPlayer.beat.COLLECT_SIZE * (aPlayer.analyser.fftsize / 2));

			var average = 0;
			for (var i = 0; i < aPlayer.beat.historyBuffer.length - 1; i++) {
				average += aPlayer.beat.historyBuffer[i];
			}
			localAverageEnergy = average / aPlayer.beat.historyBuffer.length;
			
			var timeDiff = aPlayer.audio.currentTime - aPlayer.beat.prevTime;

			if (timeDiff > 2 && aPlayer.beat.bpmTable.length > 0) {
				for (var j = 0; j < aPlayer.beat.bpmTable.length - 1; j++) {
					var timeDiffInteger = Math.round( (timeDiff / aPlayer.beat.bpmTable[j]['time']) * 1000);
					if (timeDiffInteger % (Math.round(aPlayer.beat.bpmTable[j]['time']) * 1000) == 0) {
						timeDiff = new Number(aPlayer.beat.bpmTable[j]['time']);
					}
				}
			}
			
			if (timeDiff > 3) {
				aPlayer.beat.prevTime = timeDiff = 0;
			}

			if (
				aPlayer.audio.currentTime > 0.29 && aPlayer.beat.instantEnergy > localAverageEnergy &&
				(aPlayer.beat.instantEnergy > (aPlayer.beat.sens * localAverageEnergy)) &&
				((timeDiff < 2.0 && timeDiff > 0.29) || aPlayer.beat.prevTime == 0)
			) {
				isBeat = true;
				aPlayer.beat.prevTime = aPlayer.audio.currentTime;
				aPlayer.beat.bpm = {
					time: timeDiff.toFixed(3),
					counter: 1
				}
				for (var j = 0; j < aPlayer.beat.bpmTable.length; j++) {
					if (aPlayer.beat.bpmTable[j]['time'] == aPlayer.beat.bpm['time']) {
						aPlayer.beat.bpmTable[j]['counter']++;
						aPlayer.beat.bpm = 0;
						if (aPlayer.beat.bpmTable[j]['counter'] > 3 && j < 2) {
							//console.log("Beat match");
						}

						break;
					}
				}

				if (aPlayer.beat.bpm != 0 || aPlayer.beat.bpmTable.length == 0) {
					aPlayer.beat.bpmTable.push(aPlayer.beat.bpm);
				}
				aPlayer.beat.bpmTable.sort(function(a, b) {
					return b['counter'] - a['counter'];
				});
			}

			var temp = aPlayer.beat.historyBuffer.slice(0);
			aPlayer.beat.historyBuffer = [];
			aPlayer.beat.historyBuffer = temp.slice(aPlayer.beat.COLLECT_SIZE * (aPlayer.analyser.fftsize / 2), temp.length);

			instantCounter = 0;
			aPlayer.beat.instantEnergy = 0;
			localAverageEnergy = 0;
		}

		var barWidth = (window.innerWidth / aPlayer.bufferLength) * 2.5;
		var barHeight;
		var x = 0;

		aPlayer.canvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
		/*
		for (var i = 0; i < aPlayer.bufferLength; i++) {
			barHeight = aPlayer.dataArray[i] * Math.floor(window.innerWidth / 255);
			aPlayer.canvasContext.fillStyle = 'rgb(' + (aPlayer.dataArray[i] + 100) + ',50,50)';
			aPlayer.canvasContext.fillRect(x, window.innerHeight - barHeight / 2, barWidth, barHeight);

			x += barWidth + 1;
		}
		*/

		if (isBeat) {
			console.log(isBeat);
			aPlayer.canvasContext.fillStyle = 'rgb(255,255,255)';
			aPlayer.canvasContext.fillRect(0, 0, window.innerWidth, window.innerHeight);
		}

		requestAnimationFrame(aPlayer.draw);
	},

	open: function(num)
	{
		if (!aPlayer.initialized)
		{
			aPlayer.init();
		}

		var audioSrc = aPlayer.list[num].href;
		var mdTitle = aPlayer.list[num].getAttribute("data-epname");
		var mdShow = aPlayer.list[num].getAttribute("data-show");
		var mdArtwork = aPlayer.list[num].getAttribute("data-art");
		var mdArtworkSize = aPlayer.list[num].getAttribute("data-artsize");
		var mdDate = aPlayer.list[num].getAttribute("data-date");
		document.getElementById("play-pause").innerHTML = "play_circle_outline";
		aPlayer.times.innerHTML = "";
		aPlayer.startedPlayingAt = Math.floor(new Date().getTime() / 1000);

		progressBar.setValue(0);
		progressBar.setValueBuffer(0);
		document.getElementById("player-art").src = mdArtwork;
		document.getElementById("player-title").innerHTML = mdTitle;
		document.getElementById("player-show").innerHTML = mdShow;
		if ('mediaSession' in navigator)
		{
			navigator.mediaSession.playbackState = "none";
			navigator.mediaSession.metadata = new MediaMetadata({
				title: mdTitle,
				artist: mdShow,
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
		
		document.getElementsByTagName("footer")[0].style.bottom = "0px";

		aPlayer.cur = num;
		aPlayer.audio.src = audioSrc;
		aPlayer.play();
	},

	openLive: function(elem)
	{
		if (!aPlayer.initialized)
		{
			aPlayer.init();
		}

		var audioSrc = elem.href;
		var mdTitle = elem.getAttribute("data-epname");
		var mdRadio = elem.getAttribute("data-radio");
		var mdShow = elem.getAttribute("data-show");
		var mdArtwork = elem.getAttribute("data-art");
		var mdArtworkSize = elem.getAttribute("data-artsize");
		var mdDate = elem.getAttribute("data-date");
		document.getElementById("play-pause").innerHTML = "play_circle_outline";
		aPlayer.times.innerHTML = "";
		aPlayer.schedule = elem.getAttribute("data-schedule").split("/");
		aPlayer.schedule[0] = parseInt(aPlayer.schedule[0]);
		aPlayer.schedule[1] = parseInt(aPlayer.schedule[1]);
		aPlayer.startedPlayingAt = Math.floor(new Date().getTime() / 1000);

		progressBar.setValue(0);
		progressBar.setValueBuffer(0);
		document.getElementById("player-art").src = mdArtwork;
		document.getElementById("player-title").innerHTML = mdTitle;
		document.getElementById("player-show").innerHTML = mdShow;
		if ('mediaSession' in navigator)
		{
			navigator.mediaSession.playbackState = "none";
			navigator.mediaSession.metadata = new MediaMetadata({
				title: mdTitle,
				artist: mdShow,
				album: mdRadio,
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
		aPlayer.audio.src = audioSrc;
		aPlayer.play();
	},

	togglePlayPause: function()
	{
		if (aPlayer.cur == -1)
			return aPlayer.open(0, false);
		if (aPlayer.audio.paused)
			return aPlayer.play();
		return aPlayer.pause();
	},

	play: function()
	{
		if (aPlayer.cur == -1)
			return aPlayer.open(0, false);
		if (aPlayer.audio.paused)
		{
			aPlayer.audio.play();
			document.getElementById("play-pause").innerHTML = "pause_circle_outline";
			if ('mediaSession' in navigator)
			{
				navigator.mediaSession.playbackState = "playing";
			}
		}
	},

	pause: function()
	{
		if (!aPlayer.audio.paused)
		{
			aPlayer.audio.pause();
			document.getElementById("play-pause").innerHTML = "play_circle_outline";
			if ('mediaSession' in navigator)
			{
				navigator.mediaSession.playbackState = "paused";
			}
		}
	},

	next: function()
	{
		if (aPlayer.dir == 1) {
			if (aPlayer.cur > -1 && aPlayer.cur + 1 < aPlayer.epamount)
				aPlayer.open(aPlayer.cur + 1, false);
			else
				aPlayer.open(0, false);
		}
		else
		{
			if (aPlayer.cur > 0)
				aPlayer.open(aPlayer.cur - 1, false);
			else
				aPlayer.open(aPlayer.epamount - 1, false);
		}
	},

	previous: function()
	{
		if (aPlayer.dir == 1)
		{
			if (aPlayer.cur > 0)
				aPlayer.open(aPlayer.cur - 1, false);
			else
				aPlayer.open(aPlayer.epamount - 1, false);
		}
		else
		{
			if (aPlayer.cur > -1 && aPlayer.cur + 1 < aPlayer.epamount)
				aPlayer.open(aPlayer.cur + 1, false);
			else
				aPlayer.open(0, false);
		}
	},

	getDuration: function()
	{
		if (aPlayer.cur != -2)
		{
			return Math.floor(aPlayer.audio.duration);
		}
		else
		{
			return aPlayer.schedule[1] - aPlayer.schedule[0];
		}
	},

	getCurrentTime: function() {
		if (aPlayer.cur != -2)
		{
			return Math.floor(aPlayer.audio.currentTime);
		}
		else
		{
			return aPlayer.startedPlayingAt + aPlayer.audio.currentTime - aPlayer.schedule[0];
		}
	},

	updateTimes: function(time, dur)
	{
		if (dur != Infinity)
		{
			aPlayer.times.innerHTML = formatSeconds(time) + " / " + formatSeconds(dur);
		}
		else
		{
			var tempDate = new Date();
			aPlayer.times.innerHTML = tempDate.getHours() + ":" + ("0" + tempDate.getMinutes()).slice(-2) + ":" + ("0" + tempDate.getSeconds()).slice(-2);
		}
	},

	seekTo: function(time)
	{
		aPlayer.audio.currentTime = time;
	},

	skipBack: function()
	{
		var curTime = aPlayer.getCurrentTime();
		if (curTime > 10)
			aPlayer.seekTo(curTime - 10);
	},

	skipForward: function()
	{
		var curTime = aPlayer.getCurrentTime();
		if (curTime < aPlayer.getDuration() - 11)
			aPlayer.seekTo(curTime + 10);
	},

	volumeUp: function()
	{
		if (aPlayer.audio.volume < 0.9)
			aPlayer.audio.volume += 0.1;
		else
			aPlayer.audio.volume = 1;
	},

	volumeDown: function()
	{
		if (aPlayer.audio.volume > 0.1)
			aPlayer.audio.volume -= 0.1;
		else
			aPlayer.audio.volume = 0;
	},

	setVolume: function(vol)
	{
		aPlayer.audio.volume = vol;
	},

	mute: function()
	{
		if (aPlayer.audio.muted || aPlayer.audio.volume == 0)
		{
			aPlayer.audio.muted = false;
			if (aPlayer.audio.volume < 0.1)
				aPlayer.audio.volume = 0.1;
		}
		else
		{
			aPlayer.audio.muted = true;
		}
	}
};