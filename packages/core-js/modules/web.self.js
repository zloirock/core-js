'use strict';
var global = require('../internals/global');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');

var $TypeError = TypeError;
var defineProperty = Object.defineProperty;
var INCORRECT_VALUE = global.self !== global;

// `self` getter
// https://html.spec.whatwg.org/multipage/window-object.html#dom-self
try {
  var descriptor = Object.getOwnPropertyDescriptor(global, 'self');
  // some engines have `self`, but with incorrect descriptor
  // https://github.com/denoland/deno/issues/15765
  if (INCORRECT_VALUE || !descriptor || !descriptor.get || !descriptor.enumerable) {
    defineBuiltInAccessor(global, 'self', {
      get: function self() {
        return global;
      },
      set: function self(value) {
        if (this !== global) throw new $TypeError('Illegal invocation');
        defineProperty(global, 'self', {
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
