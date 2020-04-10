const utils = require('../../utilz.js');

exports.GrantSystemAccess = async (req, res, next) => {
	//Get the token from request
	let authorization_header = req.headers.authorization.split(' ')[1];
	let token = authorization_header.split('.')[1];
	
	//use standard js to decode no lib
	let decodedToken = JSON.parse(utils.decodeBase64(token));
	//console.log(decodedToken);

	if(decodedToken['user']['role'] == "admin") {
		console.log('SYSTEM LEVEL ACCESS GRANTED');
		next();
	} else {
		return res.status(422).json({Error: [ 'Unauthorized System Access' ], Code: 604 });
		console.log('SYSTEM LEVEL ACCESS REQUEST PURGED');
	}
}