import { FaceApi as detector } from './modules/detectors.js'
import { default as laughDetector } from './modules/laughDetector.js'
import { default as frameYank } from './modules/frameYank.js'

const body = document.getElementsByTagName('body')[0],
	video = document.getElementById('cam_observer'),
	canvas = document.getElementById('video_out'),
	output = document.getElementById('output'),
	modal = document.getElementById('modal'),
	detectionToggleButton = document.getElementById('toggle_detection');

function onDetection(detections) {
	for (const type in detections) {
		const lineElt = output.querySelector(`span.${type}`);
		if (!lineElt) continue;
		lineElt.classList.remove(...detections.classes);
		lineElt.classList.add(detections[type].class);
		lineElt.querySelector('.value').innerText = detections[type].value;
	}

	detections.imageData = frameYank(video, canvas);

	laughDetector.onDetection(detections);
}
video.addEventListener('play', e => {
	console.log("webcam is streaming!");
	//detector.start(video, onDetection);
});

console.log("attempting to get webcam stream");
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
	video.srcObject = stream;
	console.log("got webcam stream");
});

detectionToggleButton.addEventListener('click', function(e) {
	const isDetecting = detector.isDetecting();
	if (isDetecting) {
		// already detecting; stop!
		detector.stop();
		body.classList.remove('detecting');
	} else {
		// not detecting; start!
		detector.start(video, onDetection);
		body.classList.add('detecting');
	}
});

let currentDetection = false;
laughDetector.addListener(d => {
	// pause detection until after user interaction?
	detector.stop();
	currentDetection = d;
	console.log("currentDetection: ", JSON.stringify(currentDetection));
	modal.classList.add('show');
});
modal.querySelectorAll(':scope button').forEach(b => b.addEventListener('click', function(e) {
	const isYes = this.classList.contains('yes');
	console.log(isYes ? 'confirmed' : 'mistake!');
	modal.classList.remove('show');
	detector.start(video, onDetection);
}))

laughDetector.init();

detector.init(() => {
	console.log("detector is ready!!");
	body.classList.removeClass('loading');
});
