'use strict';
var isCallable = require('../internals/is-callable');
var anObject = require('../internals/an-object');

// `Map.prototype.upsert` method
// https://github.com/thumbsupep/proposal-upsert
module.exports = function upsert(key, updateFn /* , insertFn */) {
  var map = anObject(this);
  var insertFn = arguments.length > 2 ? arguments[2] : undefined;
  var value;
  if (!isCallable(updateFn) && !isCallable(insertFn)) {
    throw TypeError('At least one callback required');
  }
  if (map.has(key)) {
    value = map.get(key);
    if (isCallable(updateFn)) {
      value = updateFn(value);
      map.set(key, value);
    }
  } else if (isCallable(insertFn)) {
    value = insertFn();
    map.set(key, value);
  } return value;
};
