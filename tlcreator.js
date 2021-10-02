var tlCreator = {
	pxPerSec: 6,
	url: null,
	list: null,
	wavesurfer: null,
	formRegion: null,
	loadingText: null,
	jsonReq: null,

	reloadList: function() {
		tlCreator.wavesurfer.regions.clear();
		if(tlCreator.list == null) {
			return;
		}
		for (var i = 0; i < tlCreator.list.length; i++) {
			tlCreator.wavesurfer.regions.add({
				start: tlCreator.list[i].from,
				end: tlCreator.list[i].to,
				drag: true,
				resize: true,
				preventContextMenu: true,
				color: getRandomRgba(0.2),
				data: {
					artists: tlCreator.list[i].artists,
					title: tlCreator.list[i].title,
					titleVersion: tlCreator.list[i].titleVersion,
					radioSection: tlCreator.list[i].radioSection,
					override: tlCreator.list[i].override,
					skip: tlCreator.list[i].skip
				}
			});
		}
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
	},

	loadRegionIntoForm: function(region) {
		tlCreator.unloadRegionForm();
		tlCreator.formRegion = region;
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
				titleVersion: document.getElementById("title_version").value,
				radioSection: document.getElementById("radio_section").value,
				override: document.getElementById("override").value,
				skip: document.getElementById("skip").checked
			}
		});
	},

	open: function(link) {
		try {
			var url = new URL(link);
			document.getElementById("loading").style.display = "table";
			tlCreator.wavesurfer.load(url);
		}
		catch (err) {
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
			partialRender: true,
			scrollParent: true,
			responsive: false,
			hideScrollbar: false,
			pixelRatio: 1,
			minPxPerSec: 6,
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
		});

		tlCreator.wavesurfer.on("region-update-end", function(region) {
			tlCreator.wavesurfer.enableDragSelection({
				drag: true,
				resize: true,
				preventContextMenu: true,
				color: getRandomRgba(0.2)
			});
		});

		tlCreator.wavesurfer.on("region-updated", function(region) {
			if (tlCreator.formRegion != null && tlCreator.formRegion.id == region.id) {
				tlCreator.loadRegionIntoForm(region);
			}
		});

		tlCreator.wavesurfer.on("seek", function(progress) {
			if (tlCreator.wavesurfer.isPlaying()) {
				tlCreator.wavesurfer.pause();
			}
			else {
				tlCreator.wavesurfer.play();
			}
		});

		tlCreator.wavesurfer.on("region-click", function(region, e) {
			e.stopPropagation();
			tlCreator.loadRegionIntoForm(region);
		});

		tlCreator.wavesurfer.on("region-in", function(region) {
			tlCreator.loadRegionIntoForm(region);
		});

		tlCreator.wavesurfer.on("region-out", function(region) {
			tlCreator.unloadRegionForm();
		});

		tlCreator.wavesurfer.on("region-dblclick", function(region, e) {
			if (tlCreator.wavesurfer.isPlaying()) {
				tlCreator.wavesurfer.pause();
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

		document.getElementById("importurl").addEventListener("click", function(event) {
			event.target.blur();
			var input = prompt("Open JSON file from URL...", "https://");
			if (input != null && input != "https://") {
				if (tlCreator.jsonReq != null) {
					tlCreator.jsonReq.abort();
				}
				tlCreator.jsonReq = new XMLHttpRequest();
				tlCreator.jsonReq.addEventListener("load", function() {
					try {
						tlCreator.list = JSON.parse(this.responseText);
						tlCreator.reloadList();
					}
					catch (err) {
						console.error(err);
						alert("ERROR: failed to parse existing tracklist.");
					}
				});
				tlCreator.jsonReq.addEventListener("error", function(err) {
					alert("ERROR: " + err.message);
				});
				tlCreator.jsonReq.open("GET", input);
				tlCreator.jsonReq.send();
			}
		});

		document.getElementById("waveformdata").addEventListener("wheel", function(event) {
			event.preventDefault();

			if (event.ctrlKey) {
				tlCreator.pxPerSec += event.deltaY * -0.05;
				// Restrict pxPerSec
				tlCreator.pxPerSec = Math.min(Math.max(1, tlCreator.pxPerSec), 60);
				tlCreator.wavesurfer.zoom(tlCreator.pxPerSec);
				console.log("pxPerSec: ", tlCreator.pxPerSec);
			}
			else {
				document.getElementById("waveformdata").children[0].scrollLeft += event.deltaY;
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
		window.addEventListener("beforeunload", function(event) {
			tlCreator.loadingText.innerHTML = "Goodbye";
			document.getElementById("loading").style.display = "table";
		});
	}
};

tlCreator.init();
