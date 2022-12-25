class Visualizer {
	constructor(canvasElem, audioContext, audioAnalyser) {
		// set up the canvas
		this.canvas = canvasElem;
		// this.canvas.setAttribute("width", 1920);
		// this.canvas.setAttribute("height", 1080);
		this.canvas.setAttribute("width", this.canvas.clientWidth);
		this.canvas.setAttribute("height", this.canvas.clientHeight);
		window.addEventListener("resize", (ev) => {
			this.canvas.setAttribute("width", this.canvas.clientWidth);
			this.canvas.setAttribute("height", this.canvas.clientHeight);
		});

		// get the canvas context
		this.context = this.canvas.getContext('2d');
		this.context.fillStyle = '#2A2A2A';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// save the audio context for future manipulation
		this.audioContext = audioContext;

		// get the audio analyser
		this.audioAnalyser = audioAnalyser;
		this.bufferLength = this.audioAnalyser.frequencyBinCount;
		this.freqBuffer = new Uint8Array(this.bufferLength);

		// set the theme default
		this.theme = null;

		// start the visualizer
		requestAnimationFrame(this.render);
	};

	setTheme = (newTheme) => {
		this.theme = newTheme;
	};

	// render the visualizer (drawer function for animation frames)
	render = () => {
		// get audio data
		this.audioAnalyser.getByteFrequencyData(this.freqBuffer);
		// const audioBuffer = this.audioContext.createBuffer(1, 2.2 * this.audioContext.sampleRate, this.audioContext.sampleRate); // Get 2.2 seconds of audio data
		// audioBuffer.copyToChannel(this.freqBuffer, 0, 0);

		// call the theme's render function
		if (this.theme && "render" in this.theme && typeof this.theme.render === 'function') {
			this.theme.render(this.context, this.freqBuffer, this.bufferLength);
		}

		// request the next animation frame - this is the magic that makes it work
		// usually results in a framerate that is vsync'd to the monitor refresh rate
		requestAnimationFrame(this.render);
	};
}
