'use strict';
require('../../modules/es.weak-map');
require('../../modules/esnext.weak-map.from');
var WeakMap = require('../../internals/path').WeakMap;
var weakMapFrom = WeakMap.from;

module.exports = function from(source, mapFn, thisArg) {
  return weakMapFrom.call(typeof this === 'function' ? this : WeakMap, source, mapFn, thisArg);
};
