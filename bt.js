function onDisconnected(event) {
	const device = event.target;
	console.log(`Device ${device.name} is disconnected.`);
}

var char = null;
function searchBLEDom() {
	if ('bluetooth' in navigator && 'permissions' in navigator) {
		navigator.bluetooth.requestDevice({
			filters: [
				{ services: ['0000fff0-0000-1000-8000-00805f9b34fb'] }
			]
		}).then(function(device) {
			console.log(device);
			device.addEventListener('gattserverdisconnected', onDisconnected);
			return device.gatt.connect();
		}).then(function(server) {
			console.log(server);
			return server.getPrimaryService('0000fff0-0000-1000-8000-00805f9b34fb');
		}).then(function(service) {
			console.log(service);
			return service.getCharacteristic('0000fff3-0000-1000-8000-00805f9b34fb');
		}).then(function(characteristic) {
			console.log(characteristic);
			char = characteristic;
			setColor(0, 255, 0, function() {
				setBrightness(0);
			});
		}).catch(function(err) {
			console.error(err);
		});
	}
	else {
		alert("Your browser does not support bluetooth.");
	}
}

commandInProgress = false;
function sendCommand(command, onSuccess) {
	if (!commandInProgress) {
		commandInProgress = true;
		char.writeValue(command).then(function() {
			//console.log("Command written to characteristic");
			commandInProgress = false;
			if (typeof onSuccess == 'function') {
				onSuccess();
			}
		}).catch(function(err) {
			commandInProgress = false;
			console.error(err);
		});
	}
}

function setColor(r, g, b, onSuccess) {
	var command = new Uint8Array([0x7e, 0x00, 0x05, 0x03, limitHex(r), limitHex(g), limitHex(b), 0x00, 0xef]).buffer;
	sendCommand(command, onSuccess);
}

function setColorHex(hexColor, onSuccess) {
	if (hexColor == null || hexColor.trim() == "") {
		console.warn("Hex color is empty!");
		return;
	}
	var rgbColor = hexToRgb(hexColor);
	setColor(rgbColor.r, rgbColor.g, rgbColor.b, onSuccess);
}

function setBrightness(brightness, onSuccess) {
	var command = new Uint8Array([0x7e, 0x00, 0x01, limitPerc(brightness), 0x00, 0x00, 0x00, 0x00, 0xef]).buffer;
	sendCommand(command, onSuccess);
}

function setEffectSpeed(speed) {
	var command = new Uint8Array([0x7e, 0x00, 0x02, limitPerc(speed), 0x00, 0x00, 0x00, 0x00, 0xef]).buffer;
	sendCommand(command);
}

function setModeEffect(effect) {
	var effects = {
		red: 0x80,
		blue: 0x81,
		green: 0x82,
		cyan: 0x83,
		yellow: 0x84,
		magenta: 0x85,
		white: 0x86,
		jump_rgb: 0x87,
		jump_rgbycmw: 0x88,
		gradient_rgb: 0x89,
		gradient_rgbycmw: 0x8a,
		gradient_r: 0x8b,
		gradient_g: 0x8c,
		gradient_b: 0x8d,
		gradient_y: 0x8e,
		gradient_c: 0x8f,
		gradient_m: 0x90,
		gradient_w: 0x91,
		gradient_rg: 0x92,
		gradient_rb: 0x93,
		gradient_gb: 0x94,
		blink_rgbycmw: 0x95,
		blink_r: 0x96,
		blink_g: 0x97,
		blink_b: 0x98,
		blink_y: 0x99,
		blink_c: 0x9a,
		blink_m: 0x9b,
		blink_w: 0x9c
	};
	if (effect in effects) {
		var command = new Uint8Array([0x7e, 0x00, 0x03, limitHex(effects[effect]), 0x03, 0x00, 0x00, 0x00, 0xef]).buffer;
		sendCommand(command);
	}
	else {
		throw new Exception(effect + " is not a valid effect");
	}
}

function setModeDynamic(dynamic) {
	var command = new Uint8Array([0x7e, 0x00, 0x03, limitHex(dynamic), 0x04, 0x00, 0x00, 0x00, 0xef]).buffer;
	sendCommand(command);
}

function setSensitivityForDynamicMode(sensitivity) {
	var command = new Uint8Array([0x7e, 0x00, 0x07, limitHex(sensitivity), 0x00, 0x00, 0x00, 0x00, 0xef]).buffer;
	sendCommand(command);
}