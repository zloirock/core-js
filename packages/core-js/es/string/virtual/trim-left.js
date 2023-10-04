'use strict';
require('../../../modules/es.string.trim-left');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('String', 'trimLeft');
