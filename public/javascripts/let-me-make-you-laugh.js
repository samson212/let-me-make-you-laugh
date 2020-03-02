import { FaceApi as detector } from './modules/detectors.js'

const video = document.getElementById('cam_observer'),
	output = document.getElementById('output');

video.addEventListener('play', e => {
	console.log("webcam is streaming!");
	detector.start(video, detections => {
		console.log("got detections: ", JSON.stringify(detections, null, 2));
		for (const type in detections) {
			const lineElt = output.querySelector(`span.${type}`);
			if (!lineElt) continue;
			lineElt.classList.remove(...detections.classes); 
			lineElt.classList.add(detections[type].class);
			lineElt.querySelector('.value').innerText = detections[type].value;
		}
	});
});

console.log("attempting to get webcam stream");
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
	video.srcObject = stream;
	console.log("got webcam stream");
});

detector.init();
