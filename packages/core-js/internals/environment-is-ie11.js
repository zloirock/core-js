'use strict';
var globalThis = require('../internals/global-this');

module.exports = !globalThis.ActiveXObject && 'ActiveXObject' in globalThis;
