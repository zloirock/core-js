'use strict';
require('../../../modules/es.array.concat');
require('../../../modules/es.array.species');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'concat');
