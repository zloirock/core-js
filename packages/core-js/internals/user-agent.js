var global = require('../internals/global');
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';
