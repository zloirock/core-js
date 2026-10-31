// @types: proposals/explicit-resource-management
'use strict';
var globalThis = require('../internals/global-this');
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');

var Symbol = globalThis.Symbol;

// `Symbol.asyncDispose` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.asyncdispose
defineWellKnownSymbol('asyncDispose');

if (Symbol) {
  var descriptor = Object.getOwnPropertyDescriptor(Symbol, 'asyncDispose');
  // workaround of NodeJS 20.4 bug
  // https://github.com/nodejs/node/issues/48699
  // and incorrect descriptor from some transpilers and userland helpers
  if (descriptor.enumerable && descriptor.configurable && descriptor.writable) {
    Object.defineProperty(Symbol, 'asyncDispose', { value: descriptor.value, enumerable: false, configurable: false, writable: false });
  }
}
