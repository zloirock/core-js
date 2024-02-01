'use strict';
require('../../modules/es.error.is-error');

var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = getBuiltInStaticMethod('Error', 'isError');
