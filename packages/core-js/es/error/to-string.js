'use strict';
require('../../modules/es.error.to-string');
var uncurryThis = require('../../internals/function-uncurry-this');
var toString = require('../../internals/error-to-string');

module.exports = uncurryThis(toString);
