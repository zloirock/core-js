'use strict';
require('../../../modules/es.map.constructor');
require('../../../modules/esnext.array.unique-by');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'uniqueBy');
