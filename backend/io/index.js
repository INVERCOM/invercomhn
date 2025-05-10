const path = require('path');

let libreria = {};

require('fs').readdirSync(__dirname).forEach(function (file) {
	if (file === 'index.js' || file === 'common.js') return;
	let temporal_req = require(path.join(__dirname, file))
    libreria = Object.assign(libreria, temporal_req);
});

module.exports = libreria
