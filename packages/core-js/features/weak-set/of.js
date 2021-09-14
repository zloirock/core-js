'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.weak-set');
require('../../modules/esnext.weak-set.of');
var isCallable = require('../../internals/is-callable');
var path = require('../../internals/path');

var WeakSet = path.WeakSet;
var weakSetOf = WeakSet.of;

module.exports = function of() {
  return weakSetOf.apply(isCallable(this) ? this : WeakSet, arguments);
};
