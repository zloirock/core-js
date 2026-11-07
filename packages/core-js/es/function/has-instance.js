'use strict';
require('../../modules/es.function.has-instance');
var uncurryThis = require('../../internals/function-uncurry-this');
var wellKnownSymbol = require('../../internals/well-known-symbol');

module.exports = uncurryThis(Function[wellKnownSymbol('hasInstance')]);
