'use strict';
require('../../modules/es.symbol.dispose');
require('../../modules/es.iterator.dispose');

var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = getBuiltInStaticMethod('Symbol', 'dispose');
