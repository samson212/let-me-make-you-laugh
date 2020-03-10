
const debug = require('debug')('lmmyl:utils');

module.exports = function(logger) {

	logger = logger || debug;

	function verifyMongoResult(result, actionMsg) {
		const resultObj = result.result,
			success = (resultObj.ok == 1) && (resultObj.n >= 1);

		logger(`${actionMsg} ${success ? 'succeeded' : 'failed'} (with result: ${JSON.stringify(resultObj)})`);

		return Promise.resolve(success);
	}

	return {

		thenAssert: (testFn, msg, status=0) => (out => new Promise(r => {
			if (!testFn(out)) {
				const err = new Error(msg);
				if (status) {
					err.status = status;
				}
				throw err;
			}
			return r(out);
		})),

		verifyMongoResult: verifyMongoResult,
		thenVerifyMongoResult: actionMsg => (result => verifyMongoResult(result, actionMsg)),

	};
}
