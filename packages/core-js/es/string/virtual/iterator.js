'use strict';
var wellKnownSymbol = require('../../../internals/well-known-symbol');
require('../../../modules/es.object.to-string');
require('../../../modules/es.string.iterator');

var ITERATOR = wellKnownSymbol('iterator');

module.exports = String.prototype[ITERATOR];
