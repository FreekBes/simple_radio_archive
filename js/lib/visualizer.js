class Visualizer {
	constructor(canvasElem, audioAnalyser) {
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

		// get the audio analyser
		this.audioAnalyser = audioAnalyser;
		this.bufferLength = this.audioAnalyser.frequencyBinCount;
		this.audioBuffer = new Uint8Array(this.bufferLength);

		// set the theme default
		this.theme = null;
		this.themeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-light');

		// start the visualizer
		requestAnimationFrame(this.render);
	};

	setTheme = (newTheme) => {
		this.theme = newTheme;
	};

	setThemeColor = (newThemeColor) => {
		this.themeColor = newThemeColor;
	};

	// render the visualizer (drawer function for animation frames)
	render = () => {
		this.audioAnalyser.getByteFrequencyData(this.audioBuffer);
		if (this.theme && "render" in this.theme && typeof this.theme.render === 'function') {
			this.theme.render(this.context, this.themeColor, this.audioBuffer, this.bufferLength);
		}
		requestAnimationFrame(this.render);
	};
}
