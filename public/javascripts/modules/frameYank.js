export default function(video, canvas, quality=1.0) {
	// get the context
	const context = canvas.getContext('2d');

	// make sure the canvas has the right settings
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	canvas.style.display = 'inline';

	// draw the video into the canvas' context
	context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

	// return the dataUrl
	return canvas.toDataURL('image/jpeg', quality);
}
