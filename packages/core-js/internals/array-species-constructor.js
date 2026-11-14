'use strict';
var isArray = require('../internals/is-array');
var isConstructor = require('../internals/is-constructor');
var isObject = require('../internals/is-object');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var wellKnownSymbol = require('../internals/well-known-symbol');

var SPECIES = wellKnownSymbol('species');
var $Array = Array;
var ArrayPrototype = $Array.prototype;

// `%Array%` of another realm: its `.prototype` is an array of that realm with `.constructor` pointing back
var isForeignArrayConstructor = function (C) {
  var prototype = C.prototype;
  return isArray(prototype) && prototype.constructor === C && !isPrototypeOf(ArrayPrototype, prototype);
};

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    if (C !== $Array && isConstructor(C) && isForeignArrayConstructor(C)) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? $Array : C;
};
