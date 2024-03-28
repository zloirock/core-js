'use strict';
var globalThis = require('../internals/global-this');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');

var $TypeError = TypeError;
var defineProperty = Object.defineProperty;
var INCORRECT_VALUE = globalThis.self !== globalThis;

// `self` getter
// https://html.spec.whatwg.org/multipage/window-object.html#dom-self
try {
  var descriptor = Object.getOwnPropertyDescriptor(globalThis, 'self');
  // some engines have `self`, but with incorrect descriptor
  // https://github.com/denoland/deno/issues/15765
  if (INCORRECT_VALUE || !descriptor || !descriptor.get || !descriptor.enumerable) {
    defineBuiltInAccessor(globalThis, 'self', {
      get: function self() {
        return globalThis;
      },
      set: function self(value) {
        if (this !== globalThis) throw new $TypeError('Illegal invocation');
        defineProperty(globalThis, 'self', {
          value: value,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      },
      configurable: true,
      enumerable: true,
    });
  }
} catch (error) { /* empty */ }
