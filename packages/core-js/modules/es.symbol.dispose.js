'use strict';
var globalThis = require('../internals/global-this');
var defineWellKnownSymbol = require('../internals/well-known-symbol-define');
var defineProperty = require('../internals/object-define-property').f;
var getOwnPropertyDescriptor = require('../internals/object-get-own-property-descriptor').f;

var Symbol = globalThis.Symbol;

// `Symbol.dispose` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.dispose
defineWellKnownSymbol('dispose');

if (Symbol) {
  var descriptor = getOwnPropertyDescriptor(Symbol, 'dispose');
  // workaround of NodeJS 20.4 bug
  // https://github.com/nodejs/node/issues/48699
  // and incorrect descriptor from some transpilers and userland helpers
  if (descriptor.configurable) {
    defineProperty(Symbol, 'dispose', { value: descriptor.value, enumerable: false, configurable: false, writable: false });
  }
}
