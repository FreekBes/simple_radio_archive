var keyDebug = false;

window.addEventListener("keydown", function(e) {
	if (e.target.type != 'text' && e.target.nodeName != 'TEXTAREA' && e.target.getAttribute("contenteditable") == null) {
		var key = e.keyCode || e.which;

		if (keyDebug === true) {
			alert("Keycode for KEYDOWN: " + key);
		}

		switch(key) {
			case 75:	// [K]
			case 32:	// [SPACE]
			case 19:	// [PAUSE/BREAK]
				// toggle track playback
				aPlayer.togglePlayPause();
				break;
			case 188:	// [,]
				aPlayer.previous();
				break;
			case 190:	// [.]
				aPlayer.next();
				break;
			case 74:	// [J]
			case 37:	// [ARROWLEFT]
			aPlayer.skipBack();
				break;
			case 76:	// [L]
			case 39:	// [ARROWRIGHT]
				aPlayer.skipForward();
				break;
			case 178:	// [STOP]
			case 35:	// [END]
				// stop track playback
				aPlayer.pause();
				aPlayer.seekTo(0);
				break;
			case 189:	// [-]
			case 109:	// [-]
				aPlayer.volumeDown();
				break;
			case 187:	// [=]
			case 107:	// [+]
				aPlayer.volumeUp();
				break;
			case 77:	// [M]
				aPlayer.mute();
				break;
			case 49:	// [1]
			case 97:	// [1]
				aPlayer.setVolume(0.1);
				break;
			case 50:	// [2]
			case 98:	// [2]
				aPlayer.setVolume(0.2);
				break;
			case 51:	// [3]
			case 99:	// [3]
				aPlayer.setVolume(0.3);
				break;
			case 52:	// [4]
			case 100:	// [4]
				aPlayer.setVolume(0.4);
				break;
			case 53:	// [5]
			case 101:	// [5]
				aPlayer.setVolume(0.5);
				break;
			case 54:	// [6]
			case 102:	// [6]
				aPlayer.setVolume(0.6);
				break;
			case 55:	// [7]
			case 103:	// [7]
				aPlayer.setVolume(0.7);
				break;
			case 56:	// [8]
			case 104:	// [8]
				aPlayer.setVolume(0.8);
				break;
			case 57:	// [9]
			case 105:	// [9]
				aPlayer.setVolume(0.9);
				break;
			case 48:	// [0]
			case 96:	// [0]
				aPlayer.setVolume(1.0);
				break;
			case 66:	// [B]
				searchBLEDom();
				break;
			case 85:	// [U]
				aPlayer.unformattedSeconds = true;
				break;
			case 83:	// [S]
				scrobbler.startAuth();
				break;
			case 116:	// [F5]
				window.location.reload();
				break;
		}

		return false;
	}
});
