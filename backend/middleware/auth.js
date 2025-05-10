const jwt = require('jsonwebtoken');
const fs = require('fs');
let cert_pub = fs.readFileSync(__dirname + '/../public_key.pem',  {encoding: 'utf-8'});

let verificaToken = (req, res, next) => {
    if (
		req &&
		req.headers &&
		req.headers.authorization &&
		req.headers.authorization !== '' &&
		req.headers.authorization.split('.').length === 3
    ) {
		try {
			const token = req.headers.authorization;
			const user = jwt.verify(token, cert_pub, { algorithms: ['RS256'] });
			next();
		} catch (error) {
			let status = 500;
			let message = error.message;
			let title = 'error';
			if (error && error.message && error.message === 'jwt expired') {
				status = 401;
				message = error.message;
				title = 'warning';
			}
			console.log('Error verificando token', 'Error controlado', error.message, ' || ', JSON.stringify(error));
			res.status(status).send({ type: 'warning', message, title });
		}
    } else {
		let message = 'login.toast.bad_request_message';
		let status = 400;
		res.status(status).send({ type: 'warning', message, title: 'login.toast.warning' });
    }
};

module.exports = {
    verificaToken
}