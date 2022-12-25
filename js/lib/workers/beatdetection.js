import Essentia from 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia.js-core.es.js';
// import essentia-wasm-module
import { EssentiaWASM } from 'https://cdn.jsdelivr.net/npm/essentia.js@0.1.3/dist/essentia-wasm.es.js';

const essentia = new Essentia(EssentiaWASM);

const secondsToKeep = 8.8;
const inputChannelHistory = new Float32Array(secondsToKeep * sampleRate);
inputChannelHistory.fill(0);
let lastFrame = 0;
let framesElapsed = 0;

// prints version of essentia wasm backend
console.log("Beat Detection is running Essentia version:", essentia.version);

// prints all the available algorithm methods in Essentia
// console.log(essentia.algorithmNames)

// beatdetection.js
class BeatDetectionProcessor extends AudioWorkletProcessor {
	constructor(options) {
		super();
		console.log("Number of inputs:", options.numberOfInputs);
		console.log("Useful variables:", options.processorOptions.someUsefulVariable);
	}

	process(inputs, outputs, parameters) {
		const inputChannel = inputs[0][0];
		const outputChannel = outputs[0][0];

		// copy input to output
		// for (let i = 0; i < inputChannel.length; ++i) {
		// 	outputChannel[i] = inputChannel[i];
		// }

		// get input info
		const sampleLength = 128 | inputChannel.length;

		// shift history to make space for new input
		inputChannelHistory.copyWithin(0, sampleLength);

		// copy input to history
		for (let i = 0; i < sampleLength; ++i) {
			inputChannelHistory[inputChannelHistory.length - sampleLength + i] = inputChannel[i];
		}

		// every 8 seconds, run beat detection
		// framesElapsed += currentFrame - lastFrame;
		// lastFrame = currentFrame;
		// if (framesElapsed >= sampleRate * 8) {

		// 	// run beat detection
		// 	console.log("Running beat detection now.", lastFrame, currentFrame, framesElapsed);

		// 	// start an async function to run beat detection

		// 	const inputSsignalVector = essentia.arrayToVector(inputChannelHistory);

		// 	const result = essentia.RhythmExtractor2013(inputSsignalVector);
		// 	console.log(result);

		// 	// const result = essentia.BeatTrackerDegara(inputSsignalVector);
		// 	// console.log(result.ticks);


		// 	framesElapsed = 0;
		// }

		return true;
	}
}

registerProcessor('beatdetection', BeatDetectionProcessor);
