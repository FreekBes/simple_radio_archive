var tlHandler = {
	enabled: false,
	list: null,
	jsonReq: null,
	lastPlayIndex: -1,
	beenPlayingFor: 0,
	nowPlayingUpdated: false,

	enable: function(tracklistFile) {
		if (tlHandler.jsonReq != null) {
			tlHandler.jsonReq.abort();
		}
		tlHandler.jsonReq = new XMLHttpRequest();
		tlHandler.jsonReq.addEventListener("load", function() {
			try {
				tlHandler.list = JSON.parse(this.responseText);
				tlHandler.enabled = true;
			}
			catch (err) {
				console.error(err);
				tlHandler.enabled = false;
			}
		});
		tlHandler.jsonReq.open("GET", tracklistFile);
		tlHandler.jsonReq.send();
	},

	disable: function() {
		tlHandler.enabled = false;
		tlHandler.list = null;
	},

	handle: function(currentTime, forced) {
		if (!tlHandler.enabled || tlHandler.list.length == 0 || (aPlayer.audio.paused === true && forced !== true)) {
			return;
		}

		currentTime = Number(currentTime);
		for (var i = 0; i < tlHandler.list.length; i++) {
			if (currentTime >= tlHandler.list[i].from && currentTime < tlHandler.list[i].to) {
				if (tlHandler.list[i].skip === true) {
					aPlayer.seekTo(tlHandler.list[i].to);
					tlHandler.handle(tlHandler.list[i].to);
					return;
				}
				if (tlHandler.lastPlayIndex != i || forced === true) {
					if (tlHandler.lastPlayIndex >= 0 && scrobbler.enabled) {
						if (tlHandler.beenPlayingFor >= 240 || tlHandler.beenPlayingFor > (tlHandler.list[tlHandler.lastPlayIndex].to - tlHandler.list[tlHandler.lastPlayIndex].from) / 2) {
							scrobbler.scrobble(tlHandler.list[tlHandler.lastPlayIndex]);
						}
						else {
							console.log("Could not scrobble last track to Last.fm, it wasn't played for long enough.");
						}
					}
					tlHandler.lastPlayIndex = i;
					tlHandler.beenPlayingFor = 0;
					scrobbler.nowPlayingUpdated = false;
					if ('mediaSession' in navigator) {
						navigator.mediaSession.metadata.artist = tlHandler.list[i].artists[0];
						if (tlHandler.list[i].title_version && tlHandler.list[i].title_version != "") {
							navigator.mediaSession.metadata.title = tlHandler.list[i].title + " (" + tlHandler.list[i].title_version + ")";
						}
						else {
							navigator.mediaSession.metadata.title = tlHandler.list[i].title;
						}
					}
					var extraText = "";
					if (tlHandler.list[i].override != null && tlHandler.list[i].override != "") {
						if (tlHandler.list[i].override.trim() != "") {
							extraText = tlHandler.list[i].override;
						}
					}
					else {
						if (tlHandler.list[i].radio_section != null) {
							extraText = "<b>" + tlHandler.list[i].radio_section + ":</b> ";
						}
						extraText += tlHandler.list[i].artists.join(", ") + " – " + tlHandler.list[i].title;
						if (tlHandler.list[i].title_version) {
							extraText += " <i>(" + tlHandler.list[i].title_version + ")</i>";
						}
					}
					document.getElementById("player-extra").innerHTML = extraText;
				}
				else if (tlHandler.lastPlayIndex == i) {
					tlHandler.beenPlayingFor += 0.5;
					if (scrobbler.enabled && !scrobbler.nowPlayingUpdated && tlHandler.beenPlayingFor > 5) {
						scrobbler.nowPlayingUpdated = true;
						scrobbler.updateNowPlaying(tlHandler.list[i]);
					}
				}
				return;
			}
		}
		if ('mediaSession' in navigator) {
			navigator.mediaSession.metadata.artist = "";
			navigator.mediaSession.metadata.title = "";
			tlHandler.lastPlayIndex = -1;
			tlHandler.beenPlayingFor = 0;
			scrobbler.nowPlayingUpdated = false;
		}
		document.getElementById("player-extra").innerHTML = "";
	},

	getTrackTextAt: function(currentTime) {
		if (!tlHandler.enabled || tlHandler.list.length == 0) {
			return null;
		}

		var extraText = "";
		for (var i = 0; i < tlHandler.list.length; i++) {
			if (currentTime >= tlHandler.list[i].from && currentTime < tlHandler.list[i].to) {
				if (tlHandler.list[i].override != null) {
					if (tlHandler.list[i].override.trim() == "") {
						return "";
					}
					extraText = tlHandler.list[i].override;
				}
				else {
					if (tlHandler.list[i].radio_section != null) {
						extraText = "<b>" + tlHandler.list[i].radio_section + ":</b> ";
					}
					extraText += tlHandler.list[i].artists.join(", ") + " – " + tlHandler.list[i].title;
					if (tlHandler.list[i].title_version) {
						extraText += " <i>(" + tlHandler.list[i].title_version + ")</i>";
					}
				}
				return extraText;
			}
		}
		return null;
	}
};
