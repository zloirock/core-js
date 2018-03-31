'use strict';
require('../../modules/es.weak-set');
require('../../modules/esnext.weak-set.from');
var WeakSet = require('../../internals/path').WeakSet;
var weakSetfrom = WeakSet.from;

module.exports = function from(source, mapFn, thisArg) {
  return weakSetfrom.call(typeof this === 'function' ? this : WeakSet, source, mapFn, thisArg);
};
