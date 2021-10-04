var ctrlPressed = false;

var tlCreator = {
	pxPerSec: 2,
	url: null,
	list: null,
	wavesurfer: null,
	formRegion: null,
	loadingText: null,
	jsonReq: null,

	loadList: function(list) {
		tlCreator.wavesurfer.regions.clear();
		for (var i = 0; i < list.length; i++) {
			tlCreator.wavesurfer.regions.add({
				start: list[i].from,
				end: list[i].to,
				drag: true,
				resize: true,
				preventContextMenu: true,
				color: getRandomRgba(0.2),
				data: {
					artists: list[i].artists,
					title: list[i].title,
					titleVersion: list[i].title_version,
					radioSection: list[i].radio_section,
					override: list[i].override,
					skip: list[i].skip
				}
			});
		}
	},

	loadListWithoutTimes: function(listWithoutTimes) {
		// add assumed times
		var avgRegionDuration = Math.floor(Math.floor(tlCreator.wavesurfer.getDuration()) / listWithoutTimes.length);
		var f = 0;
		var t = avgRegionDuration;
		for (var i = 0; i < listWithoutTimes.length; i++) {
			listWithoutTimes[i].from = f;
			listWithoutTimes[i].to = t;
			f = t;
			t += avgRegionDuration;
		}
		console.log(listWithoutTimes);
		tlCreator.loadList(listWithoutTimes);
	},

	unloadRegionForm: function() {
		tlCreator.formRegion = null;
		document.getElementById("start").value = "";
		document.getElementById("end").value = "";
		document.getElementById("artists").value = "";
		document.getElementById("title").value = "";
		document.getElementById("title_version").value = "";
		document.getElementById("radio_section").value = "";
		document.getElementById("override").value = "";
		document.getElementById("skip").checked = false;
		var regionElems = document.getElementsByClassName("wavesurfer-region");
		for (var i = 0; i < regionElems.length; i++) {
			regionElems[i].className = "wavesurfer-region";
		}
	},

	loadRegionIntoForm: function(region) {
		tlCreator.unloadRegionForm();
		tlCreator.formRegion = region;
		if (region == null) {
			return;
		}
		document.getElementById("start").value = region.start;
		document.getElementById("end").setAttribute("min", region.start + 2);
		document.getElementById("end").value = region.end;
		document.getElementById("start").setAttribute("max", region.end - 2);
		if (region.data.artists != null && region.data.artists != undefined) {
			document.getElementById("artists").value = region.data.artists.join(", ");
		}
		else {
			document.getElementById("artists").value = "";
		}
		if (region.data.title != null && region.data.title != undefined) {
			document.getElementById("title").value = region.data.title;
		}
		else {
			document.getElementById("title").value = "";
		}
		if (region.data.titleVersion != null && region.data.titleVersion != undefined) {
			document.getElementById("title_version").value = region.data.titleVersion;
		}
		else {
			document.getElementById("title_version").value = "";
		}
		if (region.data.radioSection != null && region.data.radioSection != undefined) {
			document.getElementById("radio_section").value = region.data.radioSection;
		}
		else {
			document.getElementById("radio_section").value = "";
		}
		if (region.data.override != null && region.data.override != undefined) {
			document.getElementById("override").value = region.data.override;
		}
		else {
			document.getElementById("override").value = "";
		}
		document.getElementById("skip").checked = (region.data.skip ? true : false);
		region.element.className = "wavesurfer-region active";
	},

	saveRegionForm: function() {
		var tempArtists = document.getElementById("artists").value.split(",");
		for (var i = 0; i < tempArtists.length; i++) {
			tempArtists[i] = tempArtists[i].trim();
		}
		tlCreator.formRegion.update({
			start: parseInt(document.getElementById("start").value),
			end: parseInt(document.getElementById("end").value),
			data: {
				artists: tempArtists,
				title: document.getElementById("title").value,
				titleVersion: (document.getElementById("title_version").value == "" ? null : document.getElementById("title_version").value),
				radioSection: (document.getElementById("radio_section").value == "" ? null : document.getElementById("radio_section").value),
				override: (document.getElementById("override").value == "" ? null : document.getElementById("override").value),
				skip: document.getElementById("skip").checked
			}
		});
	},

	exportList: function() {
		var regionIds = Object.keys(tlCreator.wavesurfer.regions.list);
		var regionsAmount = regionIds.length;
		var tracklist = [];
		var region = null;
		var tracklistObj = {};

		for (var i = 0; i < regionsAmount; i++) {
			region = tlCreator.wavesurfer.regions.list[regionIds[i]];
			tracklistObj = {
				from: region.start,
				to: region.end,
				artists: region.data.artists,
				title: region.data.title,
				title_version: region.data.titleVersion,
				radio_section: region.data.radioSection,
				override: region.data.override,
				skip: region.data.skip
			};
			tracklist.push(tracklistObj);
		}

		var tracklistStr = JSON.stringify(tracklist);
		var dl = document.createElement("a");
		var file;
		var filename = tlCreator.url.pathname.split("/").pop().replace(".mp3", ".json");
		try {
			file = new File([tracklistStr], filename, {
				type: 'application/json'
			});
		}
		catch (err) {
			file = new Blob([tracklistStr], {
				type: 'text/plain'
			});
		}
		var url = URL.createObjectURL(file);
		dl.setAttribute("href", url);
		dl.setAttribute("download", filename);
		if (document.createEvent) {
			var event = document.createEvent('MouseEvents');
			event.initEvent('click', true, true);
			dl.dispatchEvent(event);
		}
		else {
			dl.click();
		}
	},

	setRegionOverlayText: function(region) {
		if (!region.data) {
			return;
		}
		var overlayText = "";
		if (region.data.override != null && region.data.override != "") {
			overlayText = region.data.override;
		}
		else if (region.data.artists && region.data.artists.length > 0 && region.data.title != null) {
			if (region.data.radioSection != null && region.data.radioSection != "") {
				overlayText = region.data.radioSection.toUpperCase() + ": ";
			}
			overlayText += region.data.artists[0] + " - " + region.data.title;
			if (region.data.titleVersion != null && region.data.titleVersion != "") {
				overlayText += " (" + region.data.titleVersion + ")";
			}
		}
		if (region.data.skip) {
			overlayText = "[SKIP] " + overlayText;
		}
		region.element.setAttribute("data-txt-overlay", overlayText);
	},

	getBorderingRegions: function(region) {
		var before;
		var after;
		var regionIds = Object.keys(tlCreator.wavesurfer.regions.list);
		var regionsAmount = regionIds.length;
		var iRegion;

		for (var i = 0; i < regionsAmount && (before == null || after == null); i++) {
			if (regionIds[i] == region.id) {
				continue;
			}
			iRegion = tlCreator.wavesurfer.regions.list[regionIds[i]];
			if (iRegion.end >= region.start - 10 && iRegion.end <= region.start + 10) {
				before = iRegion;
			}
			else if (iRegion.start >= region.end - 10 && iRegion.start <= region.end + 10) {
				after = iRegion;
			}
		}
		return [before, after];
	},

	getPreviousRegion: function(region) {
		var regionIds = Object.keys(tlCreator.wavesurfer.regions.list);
		var regionsAmount = regionIds.length;
		var closest = Infinity;
		var prev;

		var iRegion;
		for (var i = 0; i < regionsAmount && closest > 0; i++) {
			if (regionIds[i] == region.id) {
				continue;
			}
			iRegion = tlCreator.wavesurfer.regions.list[regionIds[i]];
			if (iRegion.end <= region.start) {
				if (region.start - iRegion.end < closest) {
					prev = iRegion;
					closest = region.start - iRegion.end;
				}
			}
		}
		return (prev);
	},

	getNextRegion: function(region) {
		var regionIds = Object.keys(tlCreator.wavesurfer.regions.list);
		var regionsAmount = regionIds.length;
		var closest = Infinity;
		var next;

		var iRegion;
		for (var i = 0; i < regionsAmount && closest > 0; i++) {
			if (regionIds[i] == region.id) {
				continue;
			}
			iRegion = tlCreator.wavesurfer.regions.list[regionIds[i]];
			if (iRegion.start >= region.end) {
				if (region.end - iRegion.start < closest) {
					next = iRegion;
					closest = region.end - iRegion.start;
				}
			}
		}
		return (next);
	},

	getFirstRegion: function() {
		var regionIds = Object.keys(tlCreator.wavesurfer.regions.list);
		var regionsAmount = regionIds.length;
		var lowest = Infinity;
		var first;

		for (var i = 0; i < regionsAmount && lowest != 0; i++) {
			if (tlCreator.wavesurfer.regions.list[regionIds[i]].start < lowest) {
				first = tlCreator.wavesurfer.regions.list[regionIds[i]];
				lowest = first.start;
			}
		}
		return (first);
	},

	getLastRegion: function() {
		var regionIds = Object.keys(tlCreator.wavesurfer.regions.list);
		var regionsAmount = regionIds.length;
		var highest = -1;
		var last;

		for (var i = 0; i < regionsAmount; i++) {
			if (tlCreator.wavesurfer.regions.list[regionIds[i]].end > highest) {
				last = tlCreator.wavesurfer.regions.list[regionIds[i]];
				highest = last.end;
			}
		}
		return (last);
	},

	scrollRegionIntoView: function(region) {
		if (region != null) {
			var wave = document.getElementsByTagName("wave")[0];
			var viewLeft = wave.scrollLeft;
			var viewRight = viewLeft + wave.offsetWidth - (wave.offsetWidth / 2);

			var scrollTo = parseInt(region.element.style.left);
			if (scrollTo <= viewLeft || scrollTo >= viewRight) {
				wave.scrollLeft = scrollTo - 40;
			}
		}
	},

	open: function(link) {
		try {
			tlCreator.url = new URL(link);
			document.getElementById("loading").style.display = "table";
			tlCreator.wavesurfer.load(tlCreator.url);
		}
		catch (err) {
			console.error(err);
			alert("ERROR: " + err.message);
		}
	},

	init: function() {
		tlCreator.loadingText = document.getElementById("loadingtext");

		tlCreator.wavesurfer = WaveSurfer.create({
			container: "#waveformdata",
			waveColor: "#23AD61",
			progressColor: "#127940",
			backgroundColor: "#555555",
			cursorColor: "#EDEDED",
			partialRender: true,
			scrollParent: true,
			responsive: false,
			hideScrollbar: false,
			pixelRatio: 1,
			minPxPerSec: 2,
			skipLength: 5,
			plugins: [
				WaveSurfer.regions.create({
					regionsMinLength: 2,
					snapToGridInterval: 1,
					dragSelection: true
				})
			]
		});

		tlCreator.wavesurfer.on("ready", function() {
			console.log("Wavesurfer is ready");
			document.getElementById("loading").style.display = "none";
			tlCreator.loadingText.innerHTML = "";
			tlCreator.wavesurfer.enableDragSelection({
				drag: true,
				resize: true,
				preventContextMenu: true,
				color: getRandomRgba(0.2)
			});
			document.getElementById("importurl").disabled = false;
			document.getElementById("export").disabled = false;
			document.getElementById("import").disabled = false;
		});

		tlCreator.wavesurfer.on("error", function(str) {
			console.error(str);
			alert("ERROR: " + str);
		});

		tlCreator.wavesurfer.on("loading", function(progress) {
			if (progress >= 100) {
				tlCreator.loadingText.innerHTML = "Decoding audio and drawing waveform. This could take a while...";
			}
			else {
				tlCreator.loadingText.innerHTML = "Loading audio... " + progress + "%";
			}
		});

		tlCreator.wavesurfer.on("region-created", function(region) {
			console.log("Region created", region);
			region.update({
				start: Math.floor(region.start),
				end: Math.floor(region.end)
			});
			tlCreator.setRegionOverlayText(region);
		});

		tlCreator.wavesurfer.on("region-update-end", function(region) {
			tlCreator.wavesurfer.enableDragSelection({
				drag: true,
				resize: true,
				preventContextMenu: true,
				color: getRandomRgba(0.2)
			});
			tlCreator.loadRegionIntoForm(region);
		});

		tlCreator.wavesurfer.on("region-updated", function(region, e) {
			if (tlCreator.formRegion != null && tlCreator.formRegion.id == region.id) {
				tlCreator.loadRegionIntoForm(region);
			}
			tlCreator.setRegionOverlayText(region);
			if (!ctrlPressed && e != undefined) {
				if (e.action == "resize" || e.action == "drag") {
					tlCreator.loadRegionIntoForm(region);
					var borders = tlCreator.getBorderingRegions(region);
					if (borders[0] != undefined) {
						borders[0].update({
							end: region.start
						});
					}
					if (borders[1] != undefined) {
						borders[1].update({
							start: region.end
						});
					}
				}
				region.update({
					start: Math.floor(region.start),
					end: Math.floor(region.end)
				});
			}
		});

		tlCreator.wavesurfer.on("seek", function(progress) {
			if (!tlCreator.wavesurfer.isPlaying()) {
				tlCreator.wavesurfer.play();
			}
		});

		tlCreator.wavesurfer.on("region-click", function(region, e) {
			e.stopPropagation();
			console.log(region);
			tlCreator.loadRegionIntoForm(region);
		});

		tlCreator.wavesurfer.on("region-in", function(region) {
			tlCreator.loadRegionIntoForm(region);
		});

		tlCreator.wavesurfer.on("region-out", function(region) {
			if (tlCreator.wavesurfer.regions.getCurrentRegion() == null) {
				tlCreator.unloadRegionForm();
			}
		});

		tlCreator.wavesurfer.on("region-dblclick", function(region, e) {
			if (tlCreator.wavesurfer.regions.getCurrentRegion() && tlCreator.wavesurfer.regions.getCurrentRegion().id == region.id) {
				if (tlCreator.wavesurfer.isPlaying()) {
					tlCreator.wavesurfer.pause();
				}
				else {
					tlCreator.wavesurfer.play();
				}
				return;
			}
			if (e.shiftKey) {
				region.playLoop();
			}
			else {
				region.play();
			}
		});

		document.getElementById("open").addEventListener("click", function(event) {
			event.target.blur();
			var input = prompt("Open audio file from URL...", "https://");
			if (input != null && input != "https://") {
				tlCreator.open(input);
			}
		});

		document.getElementById("delete").addEventListener("click", function(event) {
			event.target.blur();
			if (tlCreator.formRegion != null) {
				var conf = confirm("Are you sure you want to delete this segment?");
				if (conf) {
					tlCreator.formRegion.remove();
				}
			}
		});

		document.getElementById("import").addEventListener("click", function(event) {
			event.target.blur();
			var w = 394;
			var h = 700;
			var y = window.top.outerHeight / 2 + window.top.screenY - ( h / 2);
			var x = window.top.outerWidth / 2 + window.top.screenX - ( w / 2);
			var inputWindow = window.open("tlparser.php", "inputwindow", "location=no,menubar=no,status=no,toolbar=no,directories=no,scrollbars=no,width="+w+",height="+h+",top="+y+",left="+x);
		});

		document.getElementById("importurl").addEventListener("click", function(event) {
			event.target.blur();
			var input = prompt("Open JSON file from URL...", tlCreator.url.toString().replace(".mp3", ".json"));
			if (input != null && input != "https://") {
				if (tlCreator.jsonReq != null) {
					tlCreator.jsonReq.abort();
				}
				tlCreator.jsonReq = new XMLHttpRequest();
				tlCreator.jsonReq.addEventListener("load", function() {
					try {
						var list = JSON.parse(this.responseText);
						tlCreator.loadList(list);
					}
					catch (err) {
						console.error(err);
						alert("ERROR: failed to parse existing tracklist.");
					}
				});
				tlCreator.jsonReq.addEventListener("error", function(err) {
					console.error(err);
					alert("ERROR: " + err.message);
				});
				tlCreator.jsonReq.open("GET", input);
				tlCreator.jsonReq.send();
			}
		});

		document.getElementById("export").addEventListener("click", function(event) {
			event.target.blur();
			tlCreator.exportList();
		});

		document.getElementById("waveformdata").addEventListener("wheel", function(event) {
			event.preventDefault();

			if (event.ctrlKey) {
				tlCreator.pxPerSec += event.deltaY * -0.01;
				// Restrict pxPerSec
				tlCreator.pxPerSec = Math.min(Math.max(0.5, tlCreator.pxPerSec), 60);
				tlCreator.wavesurfer.zoom(tlCreator.pxPerSec);
				console.log("pxPerSec: ", tlCreator.pxPerSec);
			}
			else {
				if (tlCreator.wavesurfer.isPlaying() && event.deltaY < 0) {
					tlCreator.wavesurfer.skipBackward();
				}
				else if (tlCreator.wavesurfer.isPlaying() && event.deltaY > 0) {
					tlCreator.wavesurfer.skipForward();
				}
				else {
					document.getElementById("waveformdata").children[0].scrollLeft += event.deltaY;
				}
			}
		});

		var editorChildren = document.getElementById("editor").children;
		for (var i = 0; i < editorChildren.length; i++) {
			if (editorChildren[i].nodeName == "INPUT") {
				editorChildren[i].addEventListener("change", tlCreator.saveRegionForm);
			}
		}
		document.getElementById("start").addEventListener("change", function(event) {
			document.getElementById("end").setAttribute("min", parseInt(event.target.value) + 2);
		});
		document.getElementById("end").addEventListener("change", function(event) {
			document.getElementById("start").setAttribute("max", parseInt(event.target.value) - 2);
		});

		document.getElementById("loading").style.display = "none";
	}
};

tlCreator.init();

var keyDebug = false;
window.addEventListener("keydown", function(e) {
	if (e.target.type != 'text' && e.target.nodeName != 'TEXTAREA' && e.target.getAttribute("contenteditable") == null) {
		var key = e.keyCode || e.which;

		if (keyDebug === true) {
			alert("Keycode for KEYDOWN: " + key);
		}

		switch(key) {
			case 32:	// [SPACE]
			case 75:	// [K]
				e.preventDefault();
				if (tlCreator.wavesurfer.isPlaying()) {
					tlCreator.wavesurfer.pause();
				}
				else {
					tlCreator.wavesurfer.play();
				}
				break;
			case 74:	// [J]
				tlCreator.wavesurfer.skipBackward();
				break;
			case 76:	// [L]
				tlCreator.wavesurfer.skipForward();
				break;
			case 37:	// [ARROW LEFT]
				e.preventDefault();
				if (tlCreator.formRegion != null) {
					tlCreator.loadRegionIntoForm(tlCreator.getPreviousRegion(tlCreator.formRegion));
					tlCreator.scrollRegionIntoView(tlCreator.formRegion);
				}
				else {
					tlCreator.loadRegionIntoForm(tlCreator.getLastRegion());
					tlCreator.scrollRegionIntoView(tlCreator.formRegion);
				}
				break;
			case 39:	// [ARROW RIGHT]
				e.preventDefault();
				if (tlCreator.formRegion != null) {
					tlCreator.loadRegionIntoForm(tlCreator.getNextRegion(tlCreator.formRegion));
					tlCreator.scrollRegionIntoView(tlCreator.formRegion);
				}
				else {
					tlCreator.loadRegionIntoForm(tlCreator.getFirstRegion());
					tlCreator.scrollRegionIntoView(tlCreator.formRegion);
				}
				break;
			case 46:	// [DEL]
				document.getElementById("delete").click();
				break;
			case 17:	// [CTRL]
				ctrlPressed = true;
				break;
		}
	}
});

window.addEventListener("keyup", function(e) {
	if (e.target.type != 'text' && e.target.nodeName != 'TEXTAREA' && e.target.getAttribute("contenteditable") == null) {
		var key = e.keyCode || e.which;

		if (keyDebug === true) {
			alert("Keycode for KEYUP: " + key);
		}

		switch(key) {
			case 17:	// [CTRL]
				ctrlPressed = false;
				break;
		}
	}
});