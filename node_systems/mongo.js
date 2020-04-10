const utils = require('./utilz.js'); 

const mongo = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;

MongoClient.connect(utils.system_configuration['system']['databases']['mongo']['url'], {  useUnifiedTopology: true, useNewUrlParser: true }, ConfigureAPI);

/* Internal Configuration */
let api = null;
let admin = null;
function ConfigureAPI(err, db) {
	if(!err) {
		api = db.db('api');
		//admin = db.db('admin').admin();
		
		utils.logData("Mongo Connected & API Configured...");
	} else if(err) { utils.logData('Mongo Not Connected'); return; }
}


async function RegisterUser(userObj) {
	//console.log(userObj);
	let col = api.collection('users');
	
	let find =  {
		$or: [
	        { email : userObj['email'] },
	        { alias:  userObj['alias'] }
		]
	}
	try {
		let user = await col.findOne(find);
		if(user !== null) {
			console.log('user found while trying to register...');
			return false;
		} else {
			userObj['role'] = 'user';
			userObj.password = await utils.bcryptGeneratePassword(userObj.password);	
			//console.log(userObj); //note no objId here.. but magically 
			
			let result = await col.insertOne(userObj).then((result) => {
				userObj['password'] = 'F00';		
				//console.log(result);
				//console.log('WTF', userObj) //somehow the insert _id is getting put in here?????
				
				return userObj;
			}).catch(err => {
				return false;
			});
			
			if(result !== false) {
				let token = await utils.GenerateJwt(userObj); 
				console.log('User Registered');
				return { jwt: token, user: userObj };
			}
			return result; //result === false at this point;
		}
	} catch(e) {
		return false;	
	}	
		
}

async function AuthenticateUser(upObj) {
	let col = api.collection('users');
	let u = utils.decodeBase64(upObj['user']);
	let p = utils.decodeBase64(upObj['password']);
	
	let find =  {
    			$or: [
	    			{ alias:  u },
		            { email : u }
				]
   			}
   			
   	try {
		let user = await col.findOne(find);		
		if(user !== null) {
			let vp = await utils.bcryptValidatePassword(p,user['password']);
			switch(vp) {
				case true:
					user['password'] = 'F00';
					let token = await utils.GenerateJwt(user);
					
					//console.log('MONGO_TOKEN: ', token);
					return { jwt: token, user: user };						
					break;
				case false:
				default:
					return false;
			}
		} else { console.log('Error: @Mongo, User Not Found.'); return false }
	} catch(error) {
		console.log('Error: @Mongo, Something Went Horribly Wrong.', error);
		return false;		
	}
}


async function findDocumentByOId(collection, _id) {
	let col = api.collection(collection);

	var oid = new ObjectId(_id);
	let find = {
		'_id': oid
	}	
	
	let doc = await col.findOne(find);
	return doc;
}

async function findDocumentByOIdWithProjection(collection, _id, projection) {
	let col = api.collection(collection);
	
	var oid = new ObjectId(_id);
	let find = {
		'_id': oid
	}
	
	let doc = await col.findOne(find, projection);
	return doc;
}


async function findDocumentByFO(collection, fo) { //fo = find object
	let col = api.collection(collection);
	
	let doc = await col.findOne(fo);
	return doc;
}

async function getCollection(collection) {
	let col = api.collection(collection);
	let docs = await col.find({}).toArray();
	return docs
}


async function insertOne(collection, doc) {
	
	let res = await api.collection(collection).insertOne(doc).then((result) => {
		return doc; //So this literally just attaches the insert id to this. SWEET...
	});
	
	//console.log(doc);
	return doc; 	
}

async function updateOne(collection, query, data) {
	let result = await api.collection(collection).updateOne(query, data);
	return result.result.nModified; 
}



module.exports = {
	RegisterUser,
	AuthenticateUser,
	
	
	findDocumentByFO,
	findDocumentByOId,
	getCollection,
	
	insertOne,
	updateOne,
	
	findDocumentByOIdWithProjection,
}


