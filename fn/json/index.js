var path = require('../../modules/_path');

module.exports = path.JSON || (path.JSON = { stringify: JSON.stringify });
