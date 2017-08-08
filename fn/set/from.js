'use strict';
require('../../modules/es6.set');
require('../../modules/esnext.set.from');
var $Set = require('../../modules/_core').Set;
var $from = $Set.from;
module.exports = function from(source, mapFn, thisArg) {
  return $from.call(typeof this === 'function' ? this : $Set, source, mapFn, thisArg);
};
