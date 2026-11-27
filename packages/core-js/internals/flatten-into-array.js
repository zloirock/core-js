'use strict';
var hasIndex = require('../internals/array-has-index');
var isArray = require('../internals/is-array');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var doesNotExceedSafeInteger = require('../internals/does-not-exceed-safe-integer');
var bind = require('../internals/function-bind-context');
var createProperty = require('../internals/create-property');

var CYCLE_CHECK_STRIDE = 256;

// `FlattenIntoArray` abstract operation
// https://tc39.es/ecma262/#sec-flattenintoarray
module.exports = function (target, source, sourceLen, start, depth, mapper, thisArg) {
  var mapFn = mapper && bind(mapper, thisArg);
  var frame = { source: source, length: sourceLen, index: 0, level: 0, parent: null };
  var ancestors = depth === Infinity && [source];

  var walk = function (stop, period) {
    while (frame !== stop) {
      var parent = frame;
      if (parent.index === parent.length) {
        if (ancestors) ancestors[parent.level] = undefined;
        frame = parent.parent;
        continue;
      }
      var index = parent.index++;
      if (!hasIndex(parent.source, index)) continue;
      var element = parent.source[index];
      if (mapFn && !parent.level) element = mapFn(element, index, source);
      if (parent.level < depth && isArray(element)) {
        var level = parent.level + 1;
        frame = { source: element, length: lengthOfArrayLike(element), index: 0, level: level, parent: parent };
        if (ancestors) {
          // Full scans catch long rings shortly after the first repeat.
          // Between scans, a recurring array must eventually revisit a depth with the same remainder.
          var step = level % CYCLE_CHECK_STRIDE ? CYCLE_CHECK_STRIDE : 1;
          var earlier = ancestors[level - period] === element ? level - period : level - step;
          while (earlier >= 0 && ancestors[earlier] !== element) earlier -= step;
          createProperty(ancestors, level, element);
          // Follow the matching period on the call stack so a getter can still end the cycle.
          if (earlier >= 0) walk(parent, level - earlier);
        } else if (parent.index === parent.length) frame.parent = parent.parent;
      } else {
        doesNotExceedSafeInteger(start + 1);
        createProperty(target, start++, element);
      }
    }
  };
  walk(null, 1);
  return start;
};
