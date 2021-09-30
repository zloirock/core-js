'use strict';
var aCallable = require('../internals/a-callable');
var lengthOfArrayLike = require('../internals/length-of-array-like');
var toObject = require('../internals/to-object');
var getBuiltIn = require('../internals/get-built-in');
var arraySpeciesCreate = require('../internals/array-species-create');

var push = [].push;

// `Array.prototype.uniqueBy` method
// https://github.com/tc39/proposal-array-unique
module.exports = function uniqueBy(resolver) {
  var that = toObject(this);
  var length = lengthOfArrayLike(that);
  var result = arraySpeciesCreate(that, 0);
  var Map = getBuiltIn('Map');
  var map = new Map();
  var resolverFunction, index, item, key;
  if (resolver != null) resolverFunction = aCallable(resolver);
  else resolverFunction = function (value) {
    return value;
  };
  for (index = 0; index < length; index++) {
    item = that[index];
    key = resolverFunction(item);
    if (!map.has(key)) map.set(key, item);
  }
  map.forEach(function (value) {
    push.call(result, value);
  });
  return result;
};
