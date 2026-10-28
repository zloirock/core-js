'use strict';
require('../../../modules/es.array.filter');
require('../../../modules/es.array.species');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'filter');
