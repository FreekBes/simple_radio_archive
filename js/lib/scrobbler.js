var scrobbler = {
	enabled: false,
	canEnable: false,
	apiKey: null,
	npReq: null,
	scrobbleReq: null,

	startAuth: function() {
		if (scrobbler.canEnable) {
			var w = 500;
			var h = 700;
			var y = window.top.outerHeight / 2 + window.top.screenY - ( h / 2);
			var x = window.top.outerWidth / 2 + window.top.screenX - ( w / 2);
			var authWindow = window.open("scrobbler.php?check=true", "authwindow", "location=no,menubar=no,status=no,toolbar=no,directories=no,scrollbars=no,width="+w+",height="+h+",top="+y+",left="+x);
		}
	},

	updateNowPlaying: function(track) {
		if (!scrobbler.enabled) {
			return;
		}
		if (scrobbler.npReq != null) {
			scrobbler.npReq.abort();
		}
		if (track.to - track.from > 30 && track.artists == null || track.artists.length == 0 || track.title == null || track.title == "") {
			return;
		}
		var trackTitle = track.title + (track.title_version ? " - " + track.title_version : "");
		scrobbler.npReq = new XMLHttpRequest();
		scrobbler.npReq.addEventListener("load", function() {
			if (this.status != 201) {
				console.error("Last.fm updateNowPlaying failed: ", this.responseText);
			}
			else {
				console.log("Now Playing updated on Last.fm");
			}
		});
		scrobbler.npReq.open("GET", "scrobbler.php?updatenp=1&artist="+encodeURIComponent(track.artists[0])+"&duration="+(track.to - track.from)+"&title="+encodeURIComponent(trackTitle));
		scrobbler.npReq.send();
	},

	scrobble: function(track) {
		if (!scrobbler.enabled) {
			return;
		}
		if (scrobbler.scrobbleReq != null) {
			scrobbler.scrobbleReq.abort();
		}
		if (track.to - track.from > 30 && track.artists == null || track.artists.length == 0 || track.title == null || track.title == "") {
			return;
		}
		var trackTitle = track.title + (track.title_version ? " - " + track.title_version : "");
		scrobbler.scrobbleReq = new XMLHttpRequest();
		scrobbler.scrobbleReq.addEventListener("load", function() {
			if (this.status != 201) {
				console.error("Last.fm updateNowPlaying failed: ", this.responseText);
			}
			else {
				console.log("Track scrobbled on Last.fm");
			}
		});
		scrobbler.scrobbleReq.open("GET", "scrobbler.php?scrobble=1&artist="+encodeURIComponent(track.artists[0])+"&duration="+(track.to - track.from)+"&title="+encodeURIComponent(trackTitle));
		scrobbler.scrobbleReq.send();
	}
};

if (document.getElementsByName("scrobbler-api-key")[0].getAttribute("content") != "null") {
	scrobbler.apiKey = document.getElementsByName("scrobbler-api-key")[0].getAttribute("content");
	scrobbler.canEnable = true;
}
