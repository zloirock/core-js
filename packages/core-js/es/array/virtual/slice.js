'use strict';
require('../../../modules/es.array.slice');
require('../../../modules/es.array.species');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'slice');
