//Native Node Packages
const https = require('https');

//3rd Party Packages
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

//Our Packages
const utils = require('./utilz.js'); 

//our Routes
const auth_routes = require('./Routes/Auth.js');
const blog_routes = require('./Routes/Blog.js');
const system_routes = require('./Routes/System.js');
const profile_routes = require('./Routes/Profile.js');
const categories_routes = require('./Routes/Categories.js');

//app
const app = express();
//middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//Apply Routes
app.use(auth_routes);
app.use(blog_routes);
app.use(system_routes);
app.use(profile_routes);
app.use(categories_routes);

/*
	Use express jwt to validate Jwt, 	
	use GrantSystemAccess for admin routes 
*/


https.createServer({
	key: utils.k3yc3r7.key,
	cert: utils.k3yc3r7.cert
},		
app).listen(8000, ()=> {
	utils.logData('Server running on port 8000...');
	
	app.use(function(err, req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, multipart/form-data');
		
		console.log(err);
		switch(err.code) {
			case "invalid_token":
			case "credentials_required":
			case "credentials_bad_format":
				switch(err.code) {
					case "invalid_token":
						console.log('Express jwt caught crappy jwt.');	
						break;
					case "credentials_required":
						console.log('No Authorization: Bearer Header found.');
						break;
					case "credentials_bad_format":
						console.log('Malformed Authroization: Bearer Header.');
						break;						
					default:
						console.log(err);
						break;				
				}
				//no matter what send kill token signal
				console.log('kill token signal sent');
				res.status(401).json({Error: ['Kill Token Signal'], Code: 601});				
				break;
			default:
				break;
		}
		if(!err) {
			next();
		}	 		
	});
	
	
	app.get('/', (req, res) => {
		res.json({ time: Date().toString()});
	});			
});		

