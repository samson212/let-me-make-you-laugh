const googleRouter = require('./detectors/google.js'),
	express = require('express'),
	router = express.Router();

/*
router.use(function(req, res, next) {
	console.log("I'm in the detectors router");
	return next();
});
*/

router.get('/test', function(req, res, next) {
	res.json(true);
})

/* Google Cloud Vision */
router.use('/google', googleRouter);

module.exports = router;
