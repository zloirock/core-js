'use strict';
var isPrototypeOf = require('../../internals/object-is-prototype-of');
var numberMethod = require('../number/virtual/clamp');

var NumberPrototype = Number.prototype;

module.exports = function (it) {
  var ownProperty = it.clamp;
  if (typeof it == 'number' || it === NumberPrototype
    || (isPrototypeOf(NumberPrototype, it) && ownProperty === NumberPrototype.clamp)) return numberMethod;
  return ownProperty;
};
