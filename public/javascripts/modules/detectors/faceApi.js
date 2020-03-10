// flags / sentinels
let shouldDetect = false,
	apiIsPrimed = false,
	faceApiOptions = false,
	onDetection = detection => { console.log(JSON.stringify(detection, null, 2)) },
	onReady = () => { console.log("face-api is ready!") };

function faceRecognitionIsReady() {
	return apiIsPrimed
		&& faceapi.nets.ssdMobilenetv1.params
		&& faceapi.nets.faceExpressionNet.params
		&& faceapi.nets.faceRecognitionNet.params;
}

function detectorIsDetecting() { return faceRecognitionIsReady() && shouldDetect; }

async function init(cb, options={}) {
	console.log("initing face-api");

	onReady = cb || onReady;

	// default options
	const defaultOptions = {
		prepWithStaticImage: true,
		minConfidence: 0.5,
	};
	for (const key in defaultOptions) {
		if (!(key in options)) {
			options[key] = defaultOptions[key];
		}
	}
	faceApiOptions = new faceapi.SsdMobilenetv1Options({minConfidence: options.minConfidence });

	// load the models
	await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
	console.log("loaded ssd mobile net");
	await faceapi.nets.faceExpressionNet.loadFromUri('models');
	console.log("loaded face expression net");
	await faceapi.nets.faceRecognitionNet.loadFromUri('models');
	console.log("loaded face recognition net");

	// prep the detector with a static image
	if (options.prepWithStaticImage) {
		console.log("loading static image");
		let base_image = new Image();
		base_image.src = "/images/testFace.jpeg";
		base_image.onload = function() {
			console.log("priming face-api with static image");
			faceapi.detectSingleFace(base_image, faceApiOptions)
				.withFaceExpressions()
				.run()
				.then(results => {
					apiIsPrimed = true;
					onReady();
					console.log("priming face-api yielded results: " + JSON.stringify(results, null, 2));
				});
		}
	} else {
		apiIsPrimed = true;
	}

	console.log("done initing face-api");
}

function classifyResults(results, classes, cutoffs) {
	const classified = {};
	for (const key in results) {
		classified[key] = classes.reduce( (rCls, thisCls, i) => rCls || ( (!cutoffs[i] || results[key] < cutoffs[i]) ? thisCls : rCls ), false );
	}
	return classified;
}

function detect(video) {
	if (!faceRecognitionIsReady() || !shouldDetect) {
		console.log("not ready or stopped!");
		// returns false if it will not recurse -- detection loop was *not* established
		return false;
	}

	console.log("detecting...");
	faceapi.detectSingleFace(video, faceApiOptions || new faceapi.SsdMobilenetv1Options())
		.withFaceExpressions()
		.run()
		.then(detections => {
			if (detections && detections.expressions) {
				const classes = ["none", "trace", "some", "lots"],
					cutoffs = [ 0.00001, 0.01, 0.5 ],
					classifications = classifyResults(detections.expressions, classes, cutoffs),
					results = Object.keys(detections.expressions).reduce((obj, type) => {
						obj[type] = {
							value: detections.expressions[type],
							class: classifications[type],
						};
						return obj;
					}, {});
				results.classes = classes;

				onDetection && onDetection(results);
			}

			// recurse
			detect(video);
		});

	// returns true if it will recurse -- detection loop is established
	return true;
}

function startDetecting(video, callback) {
	onDetection = callback || onDetection;
	shouldDetect = true;
	if (!faceRecognitionIsReady() || !detect(video)) {
		console.log("detection is not ready, defering 10ms...");
		// detection loop did not begin; try again in 10 ms
		setTimeout(() => startDetecting(video), 10);
	}
}
function stopDetecting() {
	console.log("stopping detection");
	shouldDetect = false;
}

export default {
	init: init,
	isReady: faceRecognitionIsReady,
	isDetecting: detectorIsDetecting,
	start: startDetecting,
	stop: stopDetecting, 
}

