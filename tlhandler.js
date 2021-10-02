var tlHandler = {
	enabled: false,
	list: null,
	jsonReq: null,

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
		if (!tlHandler.enabled || (aPlayer.audio.paused === true && forced !== true)) {
			return;
		}

		currentTime = Number(currentTime);
		for (var i = 0; i < tlHandler.list.length; i++) {
			if (currentTime >= tlHandler.list[i].from && currentTime < tlHandler.list[i].to) {
				if (tlHandler.list[i].skip === true) {
					aPlayer.seekTo(tlHandler.list[i].to);
					return;
				}
				if ('mediaSession' in navigator) {
					navigator.mediaSession.metadata.artist = tlHandler.list[i].artists[0];
					if (tlHandler.list[i].title_version) {
						navigator.mediaSession.metadata.title = tlHandler.list[i].title + " (" + tlHandler.list[i].title_version + ")";
					}
					else {
						navigator.mediaSession.metadata.title = tlHandler.list[i].title;
					}
				}
				var extraText = "";
				if (tlHandler.list[i].override != null) {
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
				document.getElementById("player-extra").innerHTML = extraText;
				return;
			}
			else if (tlHandler.list[i].from > currentTime) {
				break;
			}
		}
		if ('mediaSession' in navigator) {
			navigator.mediaSession.metadata.artist = "";
			navigator.mediaSession.metadata.title = "";
		}
		document.getElementById("player-extra").innerHTML = "";
	},

	getTrackTextAt: function(currentTime) {
		var extraText = "";
		for (var i = 0; i < tlHandler.list.length; i++) {
			if (currentTime >= tlHandler.list[i].from && currentTime < tlHandler.list[i].to) {
				if (tlHandler.list[i].override != null) {
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
			else if (tlHandler.list[i].from > currentTime) {
				break;
			}
		}
		return null;
	}
};
