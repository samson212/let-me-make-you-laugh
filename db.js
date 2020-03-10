const debug = require('debug')('lmmyl:db'),
	utils = require('./utils.js')(debug),
	{ MongoClient, ObjectId } = require('mongodb'),
	mongoUrl = "mongodb://localhost:27017",
	dbName = "let-me-make-you-laugh";


const db = () => MongoClient.connect(mongoUrl).then(client => client.db(dbName)).catch(err => debug("MONGO ERROR: failed to connect to mongo", err)),
	collection = name => db().then(db => db.collection(name)).catch(err => debug(`failed when getting '${name}' collection!`, err));

module.exports = {
	users: fn => fn ? collection('users').then(fn) : collection('users'),
	jokes: fn => fn ? collection('jokes').then(fn) : collection('jokes'),
};
