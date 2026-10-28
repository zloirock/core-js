'use strict';
require('../../../modules/es.array.map');
require('../../../modules/es.array.species');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'map');
