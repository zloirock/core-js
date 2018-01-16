'use strict';
require('../../modules/es.set');
require('../../modules/esnext.set.from');
var $Set = require('../../modules/_path').Set;
var $from = $Set.from;

module.exports = function from(source, mapFn, thisArg) {
  return $from.call(typeof this === 'function' ? this : $Set, source, mapFn, thisArg);
};
