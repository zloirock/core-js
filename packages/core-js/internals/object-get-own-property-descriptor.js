var DESCRIPTORS = require('core-js-internals/descriptors');
var propertyIsEnumerableModule = require('../internals/object-property-is-enumerable');
var propertyDescriptor = require('../internals/property-desc');
var toIndexedObject = require('core-js-internals/to-indexed-object');
var toPrimitive = require('../internals/to-primitive');
var has = require('core-js-internals/has');
var IE8_DOM_DEFINE = require('core-js-internals/ie8-dom-define');
var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return propertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};
