'use strict';
require('../../../modules/es.string.trim-right');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('String', 'trimRight');
