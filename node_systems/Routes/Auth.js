const utils = require('../utilz.js');
const express = require('express');
const router = express.Router();
const mongo = require('../mongo.js');
const expressJwt = require('express-jwt');

const { ValidateAuth, ValidateRegister, RunValidation } = require ('./MiddleWare/Validator.js');

router.post('/api/auth/login', ValidateAuth, RunValidation, async (req, res) => {
	let jwt_with_user = null; jwt_with_user = await mongo.AuthenticateUser(req.body);	
	if(jwt_with_user !== false && jwt_with_user !== null) {
		res.status(200).json({Success: ['User logged in.'], jwt: jwt_with_user['jwt'], user: jwt_with_user['user'], Code: 701});
	} else if(jwt_with_user === false || jwt_with_user === null) {
		res.status(401).json({Error: ['Failed Authentication'], Code: 601});
	}
});

router.post('/api/auth/register', ValidateRegister, RunValidation, async (req, res) => {
	let jwt_with_user = null; jwt_with_user = await mongo.RegisterUser(req.body);
	if(jwt_with_user  !== false && jwt_with_user  !== null) {
		res.status(200).json({Success: ['User Registered.'], jwt: jwt_with_user['jwt'], user: jwt_with_user['user'], Code: 702});
	} else if(jwt_with_user  === false || jwt_with_user  === null) {
		res.status(401).json({Error: ['Registration Failed'], Code: 602});
	}
});

router.get('/api/auth/verify/local', expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), async (req,res) => {
	//console.log(req)
	//If they got here then they have a valid token... 
	//Get User from db in case information has been updated...
	
	//Get the token from request
	let authorization_header = req.headers.authorization.split(' ')[1];
	let token = authorization_header.split('.')[1];
	
	//use standard js to decode no lib
	let decodedToken = JSON.parse(utils.decodeBase64(token));
	//console.log(decodedToken);	
	
	/* no reson to send error code user better be found if not we have a bigger problem */
	let freshUser = await mongo.findDocumentByOId('users',decodedToken['user']['_id']);	
	res.status(200).json({ Success: ['Access Granted', 'Local Token Valid', 'Fresh User Data Sent'], data: freshUser, Code: 703 });
	
	/* Implement error response, could not find user for instance... */		
});	

router.get('/api/auth/verify/fresh', expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), (req,res) => {
	res.status(200).json({ Success: ['Access Granted', 'Fresh Token Valid'], Code: 704 });
});	

module.exports = router;