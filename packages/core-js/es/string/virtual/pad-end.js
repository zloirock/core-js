'use strict';
require('../../../modules/es.string.repeat');
require('../../../modules/es.string.pad-end');
var getBuiltInPrototypeMethod = require('../../../internals/get-built-in-prototype-method');

module.exports = getBuiltInPrototypeMethod('String', 'padEnd');
