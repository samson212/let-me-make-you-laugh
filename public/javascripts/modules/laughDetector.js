const listeners = [],
	detections = [],
	thresholds = {};

function init(opts={}) {
	const defaultOpts = {
		happyThreshold: 0.02,
		surprisedThreshold: 0.02
	};
	for (const key in defaultOpts) {
		if (!(key in opts)) {
			opts[key] = defaultOpts[key];
		}
	}

	thresholds.happy = opts['happyThreshold'];
	thresholds.surprised = opts['surprisedThreshold'];

	if (false) {
		// this is for debugging
		registerListener(e => console.log(`surpassed threshold for emotion '${e.tag}' with detection: ${JSON.stringify(e.detection)}`));
	}
}

function registerDetection(detection) {
	detections.push(detection);

	for (const key in thresholds) {
		if (detection[key] && detection[key].value > thresholds[key]) {
			fireListeners({ tag: key, detection: detection[key] });
		}
	}
}

function registerListener(listener) { listeners.push(listener) }
function fireListeners(emotion) { listeners.forEach(l => l(emotion)) }

export default {
	init: init,
	onDetection: registerDetection,
	addListener: registerListener
}
