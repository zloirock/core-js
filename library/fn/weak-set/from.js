'use strict';
require('../../modules/es.weak-set');
require('../../modules/esnext.weak-set.from');
var $WeakSet = require('../../modules/_core').WeakSet;
var $from = $WeakSet.from;
module.exports = function from(source, mapFn, thisArg) {
  return $from.call(typeof this === 'function' ? this : $WeakSet, source, mapFn, thisArg);
};
