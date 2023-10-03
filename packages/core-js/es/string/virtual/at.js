'use strict';
require('../../../modules/es.string.at');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('String', 'at');
