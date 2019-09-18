'use strict';
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');

// `Map.prototype.upsert` method
// https://github.com/thumbsupep/proposal-upsert
module.exports = function upsert(key, onUpdate, onInsert) {
  var map = anObject(this);
  aFunction(onUpdate);
  aFunction(onInsert);
  var value = map.has(key) ? onUpdate(map.get(key)) : onInsert();
  map.set(key, value);
  return value;
};
