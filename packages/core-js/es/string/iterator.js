'use strict';
var uncurryThis = require('../../internals/function-uncurry-this');
var wellKnownSymbol = require('../../internals/well-known-symbol');
require('../../modules/es.object.to-string');
require('../../modules/es.string.iterator');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = uncurryThis(String.prototype[ITERATOR]);
