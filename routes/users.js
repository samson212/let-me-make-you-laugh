const debug = require('debug')('lmmyl:route:users'),
	utils = require('../utils.js')(debug),
	db = require('../db.js'),
	bcrypt = require('bcrypt'),
	router = require('express').Router();

// TODO: support non-logged in users
//			random string in the session?
//			user records for anonymous users have no username, email, etc; just the random string
//			in a different field -- fingerprint?

async function checkAvailability(fieldValue) {
	// get the user
	// TODO: make this always wait the max!
	debug(`checkAvailability(${fieldValue})`);
	const user = await db.users(users => users.findOne({$or: [ {username: fieldValue}, {email: fieldValue} ]}));
	if (!user) {
		debug("no matching user found!");
		// find a matching user
		return true;
	}

	debug("found user: ", user);
	return false;
}

/* create a user */
router.post('/', async function(req, res, next) {
	debug("creating a user with request body: "+JSON.stringify(req.body, null, 2));

	const prefix = "Creating user failed -- ",
		fail = (msg) => next(prefix+msg);

	// make sure everything's kosher
	if (!req.body) {
		return fail('request has no body?!?')
	} else if (!req.body.username) {
		return fail('username required!');
	} else if (!req.body.email) {
		// TODO: validate email
		return fail('email required!');
	} else if (req.body.email != req.body.emailConfirm) {
		return fail("emails don't match!");
	} else if (!req.body.password) {
		// TODO: validate password
		return fail('email required!');
	} else if (req.body.password != req.body.passwordConfirm) {
		return fail("passwords don't match!");
	}

	// cherrypick important fields from the body
	const userObj = [ 'username', 'email', 'password' ].reduce((obj, key) => {
		obj[key] = req.body[key];
		return obj;
	}, {});
	debug("cherrypicked user fields: "+JSON.stringify(userObj, null, 2));

	// handle casing
	['username', 'email'].forEach(key => {
		// save the cased version for display
		userObj[key+"Cased"] = userObj[key];
		// switch fields to lowercase for comparisons
		userObj[key] = userObj[key].toLowerCase();
	});

	// check if the username or email is taken
	const usernameNotFound = await checkAvailability(userObj.username, userObj.email);
	if (!usernameNotFound) {
		// if the username or email are taken, fail
		return fail('user already exists!');
	}

	// otherwise, the username and email are available; create a new user

	// hash the password
	const salt = await bcrypt.genSalt(10);
	userObj.password = await bcrypt.hash(userObj.password, salt);

	// insert into the collection
	const insertResult = await db.users(users => users.insertOne(userObj)),
		success = utils.verifyMongoResult(insertResult, `inserting user '${userObj.username}'`);

	if (success) {
		req.session.username = userObj.username;
	}

	// return the result
	return res.json(success);
});

const routeCheckAvailability = fieldKey => async (req, res, next) => {
	const available = await checkAvailability(req.params[fieldKey]);
	return res.status(200).json(available);
};
router.get('/checkAvailability/username/:username', routeCheckAvailability('username'));
router.get('/checkAvailability/email/:email', routeCheckAvailability('email'));
router.post('/:username/login', async function(req, res, next) {
	debug("attempting login for user "+req.params.username);
	// normalize the username
	req.params.username = req.params.username.toLowerCase();

	const usernameNotFound = await checkAvailability(req.params.username);
	if (usernameNotFound) {
		return res.status('404').json({success: false, message: 'login failed -- user does not exist!'});
	}

	// check the password
	const passwordIsValid = await bcrypt.compare(req.body.password, user.password);
	if (!passwordIsValid) {
		// logout
		delete req.session.username;
		// and fail
		return res.status('404').json({success: false, message: 'login failed -- bad password!'});
	}

	// otherwise, save the username in the session
	req.session.username = user.username;

	// and return success
	return res.status(200).json({success: true});
});

router.post('/logout', function(req, res, next) {
	// logout
	delete req.session.username;
	// and return success
	return res.status(200).send();
});

/* register a laugh / not laugh for a specific user */
async function registerLaugh(req, res, next, didLaugh) {
	if (req.params.username != req.session.username) {
		return next('you must be logged in!');
	}
	const detections = {
		laughed: didLaugh,
		value: req.body.value,
		joke: req.body.joke,
		imageData: req.body.imageData,
	};
	const result = await db.users(users => users.updateOne({ username: req.params.username }, { $push: { detections: detections} }) );

	return res.json(utils.verifyMongoResult(result, 'registering laugh status'));
}
router.post('/:username/laugh', (req, res, next) => registerLaugh(req, res, next, true) );
router.post('/:username/notlaugh', (req, res, next) => registerLaugh(req, res, next, false) );

module.exports = router;
