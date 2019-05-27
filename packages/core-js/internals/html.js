var global = require('../internals/global');

var document = global.document;

module.exports = document && document.documentElement;
