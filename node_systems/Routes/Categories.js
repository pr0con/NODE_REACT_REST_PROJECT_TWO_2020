const utils = require('../utilz.js');
const express = require('express');
const router = express.Router();
const mongo = require('../mongo.js');
const ObjectId = require('mongodb').ObjectID;
const expressJwt = require('express-jwt');
const slugify = require('slugify');

const {	GrantSystemAccess } = require ('./MiddleWare/GrantSystemAccess.js');

router.get('/api/categories', async (req, res) => {
	let site_categories = await mongo.findDocumentByFO('site', {site_component_id: 'categories'});
	console.log(site_categories);
	
	if(site_categories.categories.length > 0) {
		res.status(200).json({Success: ['Success Site Categories List.'], catz: site_categories, Code: 708});
	} else {
		res.status(401).json({Error: ['No System Categories'], Code: 608});
	}
});

router.get('/api/system/update/categories/add',  expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), GrantSystemAccess, async (req, res) => {
	//console.log(req);

	let ncatz = req.query.categories.split(',');
		ncatz = ncatz.map((c) => {
			return slugify(c).toLowerCase();
		});	
	
	let new_categories = [];
	ncatz.forEach((cat) =>{
		cat = { slug: cat, tags: []};
		new_categories.push(cat);
	});	
	
	let query = { $addToSet: { categories: { $each:  new_categories  }}}
	let result = await mongo.updateOne('site', {site_component_id: 'categories'}, query );
	
	let site_categories = await mongo.findDocumentByFO('site', {site_component_id: 'categories'});
	if(site_categories.categories.length > 0) {
		res.status(200).json({Success: [`Updated Categories Successfully.`], catz: site_categories, Code: 707});
	}else {
		res.status(401).json({Error: ['No System Categories'], Code: 607});	
	}	
});

router.delete('/api/system/update/categories/remove',  expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), GrantSystemAccess, async (req, res) => {
	console.log('Attempting to remove category: ', req.query.category);
	
	let query = { $pull: { categories: { slug: req.query.category }}}
	let result = await mongo.updateOne('site', {site_component_id: 'categories'}, query );	
	
	let site_categories = await mongo.findDocumentByFO('site', {site_component_id: 'categories'});
	if(site_categories.categories.length > 0) {
		res.status(200).json({Success: ['Removed Category Successfully','Sent Fresh Categories List.'], catz: site_categories, Code: 708});
	} else {
		res.status(401).json({Error: ['No System Categories'], Code: 608});
	}		
});

router.get('/api/system/update/category/tags/add',  expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), GrantSystemAccess, async (req, res) => {
	//console.log('Category: ', req.query.category);
	//console.log('Tags: ',     req.query.tags);
	
	let ntags = req.query.tags.split(',');
		ntags = ntags.map((t) => {
			return slugify(t).toLowerCase();
		});	
		
	let query = { $addToSet: { 'categories.$.tags': { $each:  ntags  }}}	
	let result = await mongo.updateOne('site', { $and: [{ site_component_id: 'categories', categories: { $elemMatch: { slug: req.query.category }}}]}, query );	
	
	let site_categories = await mongo.findDocumentByFO('site', {site_component_id: 'categories'});
	if(site_categories.categories.length > 0) {
		res.status(200).json({Success: [`Updated Category ( ${req.query.category} ) Tags Successfully.`, 'Fresh Categories Sent'], catz: site_categories, Code: 709});
	} else {
		res.status(401).json({Error: ['No System Categories'], Code: 609});	
	}	
});

router.delete('/api/system/update/category/tags/remove',  expressJwt({ secret: utils.jwtPublicKey, algorithms: [ 'RS256'] }), GrantSystemAccess, async (req, res) => {
	//console.log('Category: ', req.query.category);
	//console.log('Tag: ',     req.query.tag);	
	
	let query = { $pull: { 'categories.$.tags': req.query.tag }}
	let result = await mongo.updateOne('site', { $and: [{ site_component_id: 'categories', categories: { $elemMatch: { slug: req.query.category }}}]}, query );			
	
	
	let site_categories = await mongo.findDocumentByFO('site', {site_component_id: 'categories'});
	if(site_categories.categories.length > 0) {
		res.status(200).json({Success: ['Removed Tag Successfully','Sent Fresh Categories List.'], catz: site_categories, Code: 710});
	} else {
		res.status(401).json({Error: ['No System Categories'], Code: 610});
	}	
});

module.exports = router;