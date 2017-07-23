'use strict';
// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
var isArray = require('./_is-array');
var isObject = require('./_is-object');
var toLength = require('./_to-length');
var ctx = require('./_ctx');
var IS_CONCAT_SPREADABLE = require('./_wks')('isConcatSpreadable');

function flattenIntoArray(target, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? ctx(mapper, thisArg, 3) : undefined;
  var element, spreadable;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = source[sourceIndex];
      if (mapFn) {
        element = mapFn(element, sourceIndex, target);
      }

      spreadable = false;
      if (isObject(element)) {
        spreadable = element[IS_CONCAT_SPREADABLE];
        spreadable = spreadable !== undefined ? !!spreadable : isArray(element);
      }

      if (spreadable && depth > 0) {
        targetIndex = flattenIntoArray(target, element, toLength(element.length), targetIndex, depth - 1) - 1;
      } else {
        if (targetIndex !== toLength(targetIndex)) throw TypeError();
        target[targetIndex] = element;
      }
    }
    targetIndex++;
    sourceIndex++;
  }
  return targetIndex;
}

module.exports = flattenIntoArray;
