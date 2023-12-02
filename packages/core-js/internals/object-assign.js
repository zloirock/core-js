'use strict';
var NAMES_ORDER = require('../internals/object-get-own-property-names-order');
var IE_NULL_PROTOTYPE_BUG = require('../internals/ie-null-prototype-bug');
var uncurryThis = require('../internals/function-uncurry-this');
var fails = require('../internals/fails');
var ownKeys = require('../internals/own-keys');
var getOwnPropertyDescriptorModule = require('../internals/object-get-own-property-descriptor');
var getOwnPropertySymbolsModule = require('../internals/object-get-own-property-symbols');
var toObject = require('../internals/to-object');

var $Object = Object;
// eslint-disable-next-line es/no-object-assign -- safe
var $assign = $Object.assign;
var defineProperty = $Object.defineProperty;
var objectKeys = $Object.keys;
var getPrototypeOf = $Object.getPrototypeOf;
var concat = uncurryThis([].concat);

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
module.exports = !$assign || fails(function () {
  // should have correct order of operations (Edge bug)
  if ($assign({ b: 1 }, $assign(defineProperty({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty(this, 'b', {
        value: 3,
        enumerable: false,
      });
    },
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line es/no-symbol -- safe
  var symbol = Symbol('assign detection');
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (char) { B[char] = char; });
  return $assign({}, A)[symbol] !== 7 || objectKeys($assign({}, B)).join('') !== alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  while (argumentsLength > index) {
    var S = $Object(arguments[index++]);
    var IE_WORKAROUND = IE_NULL_PROTOTYPE_BUG && getPrototypeOf(S) === null;
    var keys = NAMES_ORDER ? ownKeys(S) : objectKeys(S);
    if (!NAMES_ORDER && getOwnPropertySymbols) keys = concat(keys, getOwnPropertySymbols(S));
    var length = keys.length;
    var j = 0;
    var key, descriptor;
    while (length > j) {
      key = keys[j++];
      descriptor = getOwnPropertyDescriptor(S, key);
      if (descriptor ? descriptor.enumerable : IE_WORKAROUND && key in S) T[key] = S[key];
    }
  } return T;
} : $assign;
