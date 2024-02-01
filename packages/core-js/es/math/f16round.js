'use strict';
require('../../modules/es.math.f16round');

var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = getBuiltInStaticMethod('Math', 'f16round');
