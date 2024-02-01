'use strict';
require('../../modules/es.string.repeat');
require('../../modules/es.regexp.escape');

var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = getBuiltInStaticMethod('RegExp', 'escape');
