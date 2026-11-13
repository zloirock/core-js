'use strict';
var DESCRIPTORS = require('../internals/descriptors');
var NAMES_ORDER = require('../internals/object-get-own-property-names-order');
var IE_NULL_PROTOTYPE_BUG = require('../internals/ie-null-prototype-bug');
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var objectKeys = require('../internals/object-keys');
var objectGetPrototypeOf = require('../internals/object-get-prototype-of');
var ownKeys = require('../internals/own-keys');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var toObject = require('../internals/to-object');
var IndexedObject = require('../internals/indexed-object');

// eslint-disable-next-line es/no-object-assign -- safe
var $assign = Object.assign;
// eslint-disable-next-line es/no-object-defineproperty -- required for testing
var defineProperty = Object.defineProperty;
var concat = uncurryThis([].concat);

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
module.exports = !$assign || fails(function () {
  // should have correct order of operations (Edge bug)
  if (DESCRIPTORS && $assign({ b: 1 }, $assign(defineProperty({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line es/no-symbol -- safe
  var symbol = Symbol('assign detection');
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  // eslint-disable-next-line es/no-array-prototype-foreach -- safe
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return $assign({}, A)[symbol] !== 7 || objectKeys($assign({}, B)).join('') !== alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject(arguments[index++]);
    var IE_WORKAROUND = IE_NULL_PROTOTYPE_BUG && objectGetPrototypeOf(S) === null;
    var keys = DESCRIPTORS && NAMES_ORDER ? ownKeys(S) : objectKeys(S);
    if ((!DESCRIPTORS || !NAMES_ORDER) && getOwnPropertySymbols) keys = concat(keys, getOwnPropertySymbols(S));
    var length = keys.length;
    var j = 0;
    var key, descriptor;
    while (length > j) {
      key = keys[j++];
      descriptor = DESCRIPTORS && getOwnPropertyDescriptor(S, key);
      if (!DESCRIPTORS || (descriptor ? descriptor.enumerable : IE_WORKAROUND && key in S)) T[key] = S[key];
    }
  } return T;
} : $assign;
