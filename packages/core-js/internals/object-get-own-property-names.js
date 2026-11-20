'use strict';
var fails = require('../internals/fails');
var getBuiltIn = require('../internals/get-built-in');
var toIndexedObject = require('../internals/to-indexed-object');
var internalObjectKeys = require('../internals/object-keys-internal');
var enumBugKeys = require('../internals/enum-bug-keys');

// eslint-disable-next-line es/no-object-getownpropertynames -- safe
var nativeGetOwnPropertyNames = Object.getOwnPropertyNames;
var ownKeys = getBuiltIn('Reflect', 'ownKeys');
var Proxy = getBuiltIn('Proxy');
var iterator = Proxy && getBuiltIn('Symbol', 'iterator');
var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// Rhino throws if a proxy's ownKeys trap reports a symbol.
var PROXY_SYMBOL_BUG = ownKeys && typeof iterator == 'symbol' && !fails(function () {
  var proxy = new Proxy({}, { ownKeys: function () { return [iterator]; } });
  return !fails(function () { return nativeGetOwnPropertyNames(proxy).length; }) || ownKeys(proxy)[0] !== iterator;
});

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
exports.f = PROXY_SYMBOL_BUG ? function getOwnPropertyNames(O) {
  var keys = ownKeys(toIndexedObject(O));
  var length = 0;
  for (var i = 0; i < keys.length; i++) {
    if (typeof keys[i] == 'string') keys[length++] = keys[i];
  }
  keys.length = length;
  return keys;
} : nativeGetOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};
