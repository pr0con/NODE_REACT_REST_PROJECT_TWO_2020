const { check, validationResult } = require('express-validator');

exports.ValidateAuth = [
	check('user').not().isEmpty().withMessage('user required (alias or email)'),
	check('password').not().isEmpty().withMessage('password required.'),
	check('user').custom((value, { req }) => value !== "dW5kZWZpbmVk").withMessage('user required (alias or email)'),
	check('password').custom((value, { req }) => value !== "dW5kZWZpbmVk").withMessage('password required.'),
]

exports.ValidateRegister = [
	check('name').not().isEmpty().withMessage('Provide your name...'),
	check('alias').not().isEmpty().withMessage('A unique alias is reuqired'),
	check('alias').custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the alias'),
	check('email').isEmail().withMessage('Please provide a valid email address'),
	check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
]

exports.ValidateProfileUpdate = [
	check('name').not().isEmpty().withMessage('Provide your name...'),
	check('alias').not().isEmpty().withMessage('A unique alias is reuqiredl'),
	check('alias').custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the alias'),
	check('email').isEmail().withMessage('Please provide a valid email address'),	
]

exports.RunValidation = (req, res, next) => {
	const errors = validationResult(req);	
	if(!errors.isEmpty()) {
		let result = errors.array().map(e => e.msg);
		console.log(result);
		
		return res.status(422).json({ Code: 600, Error: [ ...result ] });	
	}
	next();
}