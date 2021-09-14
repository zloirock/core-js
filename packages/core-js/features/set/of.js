'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.set');
require('../../modules/esnext.set.of');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var Set = path.Set;
var setOf = Set.of;

module.exports = function of() {
  return setOf.apply(isCallable(this) ? this : Set, arguments);
};
