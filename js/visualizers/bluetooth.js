class BluetoothVisualizer {
	constructor() {
		this.beatBar = 2;
		this.fpsInterval = 1000 / 15;
		this.lastFrameTime = Date.now();
	}

	render(ctx, themeColor, audioBuffer, bufferLength) {
		const now = Date.now();
		const elapsed = now - this.lastFrameTime;
		const tinyThemeColor = tinycolor(themeColor);

		if (elapsed > this.fpsInterval) {
			ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
			this.lastFrameTime = now - (elapsed % this.fpsInterval);
			// const bPerc = 1.8 * Math.ceil(audioBuffer[this.beatBar] / 255 * 100) - 80;
			// const bPerc = 3.5 * Math.ceil(audioBuffer[this.beatBar] / 255 * 100) - 250;
			const bPerc = 0.13 * Math.pow((Math.ceil(audioBuffer[this.beatBar] / 255 * 100) - 70), 2);
			// console.log(audioBuffer[this.beatBar] + " becomes " + Math.ceil(audioBuffer[this.beatBar] / 255 * 100) + " becomes " + bPerc);
			if (audioBuffer[this.beatBar] > 0) {
				//console.log(Math.ceil((255 / audioBuffer[this.beatBar]) * 100));
				if (char) {
					setBrightness(bPerc);
				}
				// ctx.fillStyle = 'rgb(18, 255 ,64, ' + (bPerc / 100) + ')';
				ctx.fillStyle = tinyThemeColor.saturate(10).setAlpha(bPerc / 100).toRgbString();
				ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
			}
			else {
				if (char) {
					setBrightness(0);
				}
				// ctx.fillStyle = 'rgb(18, 255 ,64, 0)';
				ctx.fillStyle = tinyThemeColor.setAlpha(0).toRgbString();
				ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
			}
		}
	}
}
