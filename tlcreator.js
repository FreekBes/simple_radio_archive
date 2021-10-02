var tlCreator = {
	pxPerSec: 10,
	wavesurfer: null,
	loadingText: null,

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
			minPxPerSec: 10,
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
				preventContextMenu: true
			});
		});

		tlCreator.wavesurfer.on("error", function(str) {
			console.error(str);
		});

		tlCreator.wavesurfer.on("loading", function(progress) {
			if (progress >= 100) {
				tlCreator.loadingText.innerHTML = "Drawing waveform... This could take a while.";
			}
			else {
				tlCreator.loadingText.innerHTML = "Loading audio... " + progress + "%";
			}
		});

		tlCreator.wavesurfer.on("region-created", function(region) {
			console.log("Region created", region);
		});

		tlCreator.wavesurfer.on("region-click", function(region) {
			console.log("Region clicked", region);
		});

		tlCreator.wavesurfer.on("region-dblclick", function(region) {
			console.log("Region double clicked", region);
		});

		document.getElementById("open").addEventListener("click", function(event) {
			event.target.blur();
			var input = prompt("Open audio file from URL...", "https://");
			if (input != null && input != "https://") {
				tlCreator.open(input);
			}
		});

		document.getElementById("waveformdata").addEventListener("wheel", function(event) {
			event.preventDefault();

			tlCreator.pxPerSec += event.deltaY * -0.05;
			// Restrict pxPerSec
			tlCreator.pxPerSec = Math.min(Math.max(1, tlCreator.pxPerSec), 60);
			tlCreator.wavesurfer.zoom(tlCreator.pxPerSec);
			console.log("pxPerSec: ", tlCreator.pxPerSec);
		});

		document.getElementById("loading").style.display = "none";
		window.addEventListener("beforeunload", function(event) {
			tlCreator.loadingText.innerHTML = "Goodbye";
			document.getElementById("loading").style.display = "table";
		});
	},

	open: function(link) {
		try {
			var url = new URL(link);
			document.getElementById("loading").style.display = "table";
			tlCreator.wavesurfer.load(url);
		}
		catch (err) {
			alert("Could not open audio file: " + err.message);
		}
	}
};

tlCreator.init();
