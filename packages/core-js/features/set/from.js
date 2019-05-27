'use strict';
require('../../modules/es.set');
require('../../modules/esnext.set.from');
var path = require('../../internals/path');

var Set = path.Set;
var setFrom = Set.from;

module.exports = function from(source, mapFn, thisArg) {
  return setFrom.call(typeof this === 'function' ? this : Set, source, mapFn, thisArg);
};
