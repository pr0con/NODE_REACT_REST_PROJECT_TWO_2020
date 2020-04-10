const utils = require('../utilz.js');
const express = require('express');
const router = express.Router();
const mongo = require('../mongo.js');
const ObjectId = require('mongodb').ObjectID;
const expressJwt = require('express-jwt');
const mime = require('mime');
const { ValidateProfileUpdate, RunValidation } = require ('./MiddleWare/Validator.js');

/*Multer*/
const multer = require('multer');

var multerStorage = multer.diskStorage({
	destination: function(req,file,callback){
		callback(null, '/var/www/parcel_blueprint/dist/uploads/profile_images');	
	},
	filename: function(req,file,callback) {
		//console.log('REQ: ',req)
		//Two weeks ago this was mime.extension just be aware....
		callback(null, req.headers.uoid+"."+mime.getExtension(file.mimetype));
	}		
});	
var multerSingleUpload = multer({ storage: multerStorage });


/* Image path always same here dont need updated users sent */
router.post('/api/profile/image',  expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), multerSingleUpload.single('filepond'),  async (req, res) => {
	const file = req.file;
	if(!file) {
		res.status(401).json({Error: ['Failed Profile Image Upload.'], Code: 606});
	} else {

		/* file upload success lets update profile image path && send new user data... */
		var oid = new ObjectId(req.headers.uoid);
		let result = await mongo.updateOne('users', {'_id': oid }, { $set: { 'profile_image_path': '/uploads/profile_images/'+req.headers.uoid+"."+mime.getExtension(file.mimetype)  }});		
		
		console.log('PROFILE_MONGO_RESULT: ', result)
		res.status(200).json({Success: ['Success Profile Image Upload.'], Code: 706});	
	}
});

router.post('/api/profile/update', expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), ValidateProfileUpdate, RunValidation, async (req,res) => {
	console.log(req.body);
	
	var oid = new ObjectId(req.headers.uoid);
	let query = { $set: { name: req.body.name, alias: req.body.alias, email: req.body.email,  }}
	let result = await mongo.updateOne('users', {'_id': oid }, query );
	
	//let users = await mongo.getCollection('users');
	res.status(200).json({Success: ['User Information Updated.','New User Data Sent.'], users: [], Code: 705});	
});

module.exports = router;
