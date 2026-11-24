'use strict';
var globalThis = require('../internals/global-this');
var uncurryThis = require('../internals/function-uncurry-this');
var classof = require('../internals/classof-raw');
var hasOwn = require('../internals/has-own-property');
var wellKnownSymbol = require('../internals/well-known-symbol');
var TO_STRING_TAG_SUPPORT = require('../internals/to-string-tag-support');
var TypedArrayConstructors = require('../internals/typed-array-constructors');

var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var TypedArrayPrototype = Object.getPrototypeOf(Int8Array.prototype);

var getter = function (prototype, key) {
  // FF15 throws on the descriptor of `length` of a typed array prototype
  try {
    var descriptor = getOwnPropertyDescriptor(prototype, key);
    return descriptor && descriptor.get && uncurryThis(descriptor.get);
  } catch (error) { /* empty */ }
};

var getTag = TO_STRING_TAG_SUPPORT && getter(TypedArrayPrototype, wellKnownSymbol('toStringTag'));
var lengthGetters = {};

if (TO_STRING_TAG_SUPPORT) Object.keys(TypedArrayConstructors).forEach(function (name) {
  var Constructor = globalThis[name];
  // Rhino 1.8 has a getter per class
  var getLength = Constructor && (getter(Constructor.prototype, 'length') || getter(TypedArrayPrototype, 'length'));
  if (getLength) lengthGetters[name] = getLength;
});

var entered = false;

var getNameByClass = function (it) {
  var name;
  // in Rhino 1.8, `Object.prototype.toString` reads `@@toStringTag` and the polyfill of its getter calls this function
  if (!entered) try {
    entered = true;
    name = classof(it);
  } finally {
    entered = false;
  }
  // the tag could be forged, so the brand is checked by a native getter
  if (hasOwn(lengthGetters, name)) try {
    lengthGetters[name](it);
    return name;
  } catch (error) { /* empty */ }
};

// [[TypedArrayName]] of a typed array, `undefined` for any other value
module.exports = !TO_STRING_TAG_SUPPORT ? function (it) {
  // without `@@toStringTag` support, the class from `Object.prototype.toString` can't be forged
  var name = classof(it);
  if (hasOwn(TypedArrayConstructors, name)) return name;
} : getTag ? function (it) {
  // the native getter reads the internal slot - it ignores the prototype and own properties of the receiver,
  // but in FF51-65 it does not accept typed arrays from other realms
  return getTag(it) || getNameByClass(it);
} : getNameByClass;
