'use strict';
require('../../../modules/es.array.entries');
require('../../../modules/es.object.to-string');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('Array', 'entries');
