'use strict';
var anObject = require('../internals/an-object');

// `Map.prototype.upsert` method
// https://github.com/thumbsupep/proposal-upsert
module.exports = function upsert(key, updateFn, insertFn) {
  var map = anObject(this);
  if (typeof updateFn != 'function' && typeof insertFn != 'function') {
    throw TypeError('At least one callback required');
  }
  var value;
  if (map.has(key)) {
    value = map.get(key);
    if (typeof updateFn == 'function') {
      value = updateFn(value);
      map.set(key, value);
    }
  } else if (typeof insertFn == 'function') {
    value = insertFn();
    map.set(key, value);
  } return value;
};
