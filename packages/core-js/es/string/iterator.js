'use strict';
var uncurryThis = require('../../internals/function-uncurry-this');
var getIteratorMethod = require('../../internals/get-iterator-method');
require('../../modules/es.object.to-string');
require('../../modules/es.string.iterator');

module.exports = uncurryThis(getIteratorMethod(''));
