// @types: proposals/symbol-description
// `Symbol.prototype.description` getter
// https://tc39.es/ecma262/#sec-symbol.prototype.description
'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var IS_PURE = require('../internals/is-pure');
var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');
var getBuiltIn = require('../internals/get-built-in');
var isCallable = require('../internals/is-callable');
var isPrototypeOf = require('../internals/object-is-prototype-of');
var toString = require('../internals/to-string');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var copyConstructorProperties = require('../internals/copy-constructor-properties');
var symbolDescription = require('../internals/symbol-description');

var NativeSymbol = globalThis.Symbol;
var SymbolPrototype = NativeSymbol && NativeSymbol.prototype;

if (isCallable(NativeSymbol) && (!IS_PURE || NATIVE_SYMBOL) && !symbolDescription.correct) {
  var EmptyStringDescriptionStore = symbolDescription.empty;
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : toString(arguments[0]);
    var result = isPrototypeOf(SymbolPrototype, this)
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      // eslint-disable-next-line sonarjs/inconsistent-function-call -- preserve the constructor rejection
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };

  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  // @dependency: es.symbol.constructor
  if (IS_PURE) copyConstructorProperties(SymbolWrapper, getBuiltIn('Symbol'));
  SymbolWrapper.prototype = SymbolPrototype;
  if (!IS_PURE) {
    SymbolPrototype.constructor = SymbolWrapper;
    defineBuiltInAccessor(SymbolPrototype, 'description', {
      configurable: true,
      get: symbolDescription.get,
    });
  }

  $({ global: true, constructor: true, forced: true }, {
    Symbol: SymbolWrapper,
  });
}
