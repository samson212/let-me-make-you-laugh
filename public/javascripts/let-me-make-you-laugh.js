import { FaceApi as detector } from './modules/detectors.js'
import { default as laughDetector } from './modules/laughDetector.js'

const video = document.getElementById('cam_observer'),
	output = document.getElementById('output'),
	modal = document.getElementById('modal');

video.addEventListener('play', e => {
	console.log("webcam is streaming!");
	detector.start(video, detections => {
		for (const type in detections) {
			const lineElt = output.querySelector(`span.${type}`);
			if (!lineElt) continue;
			lineElt.classList.remove(...detections.classes); 
			lineElt.classList.add(detections[type].class);
			lineElt.querySelector('.value').innerText = detections[type].value;
		}

		laughDetector.onDetection(detections);
	});
});

console.log("attempting to get webcam stream");
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
	video.srcObject = stream;
	console.log("got webcam stream");
});

laughDetector.addListener(e => {
	modal.classList.add('show');
});
modal.querySelectorAll(':scope button').forEach(b => b.addEventListener('click', function(e) {
	const isYes = this.classList.contains('yes');
	console.log(isYes ? 'confirmed' : 'mistake!');
	modal.classList.remove('show');
}))

laughDetector.init();

detector.init();
