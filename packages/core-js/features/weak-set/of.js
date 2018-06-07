'use strict';
require('../../modules/es.weak-set');
require('../../modules/esnext.weak-set.of');
var WeakSet = require('../../internals/path').WeakSet;
var weakSetOf = WeakSet.of;

module.exports = function of() {
  return weakSetOf.apply(typeof this === 'function' ? this : WeakSet, arguments);
};
