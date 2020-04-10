const utils = require('../utilz.js');
const express = require('express');
const router = express.Router();
const mongo = require('../mongo.js');
const ObjectId = require('mongodb').ObjectID;
const expressJwt = require('express-jwt');

const {	GrantSystemAccess } = require ('./MiddleWare/GrantSystemAccess.js');

router.get('/api/system/get/users',  expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), GrantSystemAccess, async (req, res) => {
	let users = await mongo.getCollection('users');
	if(users.length > 0) {
		res.status(200).json({Success: ['Users Collection Accessed.'], users: users, Code: 705});
	} else {
		res.status(401).json({Error: ['Failed Gathering Users'], Code: 605});
	}
});

router.post('/api/system/update/user',  expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), GrantSystemAccess, async (req, res) => {
	var oid = new ObjectId(req.body.uoid);
	let result = await mongo.updateOne('users', {'_id': oid }, { $set: { 'role': req.body.role }});
	
	let users = await mongo.getCollection('users');
	res.status(200).json({Success: [`User updated count(${result})`, 'Fresh Users List Sent...'], users: users, Code: 706});
});

/* get user object from jwt */
router.get('/api/system/extract-user-from-jwt',  expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), async (req, res) => {
	let authorization_header = req.headers.authorization.split(' ')[1];
	let token = authorization_header.split('.')[1];
	
	let decodedToken = JSON.parse(utils.decodeBase64(token));
	if('user' in decodedToken) {
		res.status(200).json({Success: [`User Extracted From Jwt`], user: decodedToken['user'], Code: 711});
	}else {
		res.status(401).json({Error: ['Failed Extracting User from jwt'], Code: 611});
	}	
});


module.exports = router;