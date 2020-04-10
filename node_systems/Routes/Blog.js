const fs = require('fs');

const utils = require('../utilz.js');
const express = require('express');
const router = express.Router();
const mongo = require('../mongo.js');
const ObjectId = require('mongodb').ObjectID;
const expressJwt = require('express-jwt');
const slugify = require('slugify');

const mime = require('mime');
/*Multer*/
const multer = require('multer');


/* Header Image upload */
var multerStorage = multer.diskStorage({
	destination: function(req,file,callback){
		callback(null, '/var/www/parcel_blueprint/dist/uploads/blog_header_images');	
	},
	filename: function(req,file,callback) {
		//console.log('REQ: ',req)
		callback(null, req.headers.boid+"."+mime.getExtension(file.mimetype));
	}
});


var multerSingleUpload = multer({ storage: multerStorage });


/* Available Blog Images Uplaod */
var multerMultiStorage = multer.diskStorage({
    fileFilter: (req, file, cb) => {
        // allow images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image are allowed.'), false);
        }
        cb(null, true);
    },    	
	destination: function(req,file,callback){
		let dest = '/var/www/parcel_blueprint/dist/uploads/available_blog_images/'+req.headers.boid;
		if(!fs.existsSync(dest)) {  fs.mkdirSync(dest); }
		callback(null, dest);	
	},
	filename: function(req,file,callback) {
		//insert new record in mongo....
		let new_file_name = req.headers.boid+'-'+Date.now()+"."+mime.getExtension(file.mimetype)
		
		let oid = new ObjectId(req.headers.boid);
		let result = mongo.updateOne('blogs', {'_id': oid}, {$addToSet: { 'available_images': `uploads/available_blog_images/${req.headers.boid}/${new_file_name}`}});
		
		callback(null, new_file_name);
	},
});
var multerMultiUpload = multer({ storage: multerMultiStorage });


/* Okay so this confirms it passing a global in the return of the real insert one inside mongo literally ads the insertId */
router.post('/api/blogs/new',  expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), async (req, res) => {
	console.log(req.body);
	
	req.body.slug = slugify(req.body.title).toLowerCase();
	
	let new_blog = await mongo.insertOne('blogs', req.body);
	console.log(new_blog);
	
	if('_id' in new_blog) {
		res.status(200).json({Success: [`New blog created`], blogId: new_blog._id, Code: 712});
	}else {
		res.status(401).json({Error: ['New blog creation failed...'], Code: 612});	
	}
});

router.post('/api/blog/header/image/upload', expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), multerSingleUpload.single('filepond'), async (req, res) => {
	const file = req.file;
	if(!file) {
		res.status(401).json({Error: ['Failed Uploading Header Image...'], Code: 613});
	} else {

		var oid = new ObjectId(req.headers.boid);		
		let result = await mongo.updateOne('blogs', {'_id': oid }, { $set: { 'header_image_path': '/uploads/blog_header_images/'+req.headers.boid+"."+mime.getExtension(file.mimetype)  }});
		
	
		console.log(`Updated (${parseInt(result)}) Blog(s)...`);
		if(parseInt(result) === 1) {
			res.status(200).json({Success: ['Success Blog Header Image Upload.'], Code: 713});	
		} else if(parseInt(result) === 0) {
			fs.unlinkSync('/var/www/parcel_blueprint/dist/uploads/blog_header_images/'+req.headers.boid+"."+mime.getExtension(file.mimetype) );
			res.status(401).json({Error: ['Blog Disapeard from database...?','Removed stale file...'], Code: 613});
		}			
	}
		
});


router.post('/api/blog/available/images/upload', expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), multerMultiUpload.array('filepond'), async (req, res) => {
	const files = req.files;
	if(!files) {
		res.status(401).json({Error: ['Failed Uploading avail blog images...'], Code: 614});
	} else {
		res.status(200).json({Success: ['Success Blogs Available Image Stack Upated.'], Code: 714});	
	}	
});

router.get('/api/blog/get/available/images/:boid',  expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }),  async (req, res) => {
	let blog_images = await mongo.findDocumentByOIdWithProjection('blogs',req.params.boid, { projection: { 'available_images': 1 }});
	if(blog_images.available_images.length > 0) {
		res.status(200).json({Success: ['Success Blogs Available Image Stack Upated.'], availImages: blog_images ,Code: 715});
	}else if(!('available_images' in blog_images)) {
		res.status(401).json({Error: ['Failed Uploading avail blog images...'], Code: 615});
	}
	console.log(blog_images);	
});


module.exports = router;