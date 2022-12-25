class BasicVisualizer {
	constructor() {

	}

	render(ctx, freqBuffer, freqBufferLength) {
		const barWidth = (ctx.canvas.clientWidth / freqBufferLength) * 2.5;
		let barHeight;
		let x = 0;

		ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
		for (var i = 0; i < freqBufferLength; i++) {
			barHeight = freqBuffer[i] * Math.floor(ctx.canvas.clientHeight / 142);
			ctx.fillStyle = 'rgb(18, ' + (freqBuffer[i] + 64) + ',64)';
			ctx.fillRect(x, ctx.canvas.clientHeight - barHeight / 2, barWidth, barHeight);
			ctx.fillRect(ctx.canvas.clientWidth - x - barWidth, ctx.canvas.clientHeight - barHeight / 2, barWidth, barHeight);

			x += barWidth + 1;
		}
	}
}
