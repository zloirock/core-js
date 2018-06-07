'use strict';
require('../../modules/es.set');
require('../../modules/esnext.set.of');
var Set = require('../../internals/path').Set;
var setOf = Set.of;

module.exports = function of() {
  return setOf.apply(typeof this === 'function' ? this : Set, arguments);
};
