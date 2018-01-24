var global = require('./global');
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';
