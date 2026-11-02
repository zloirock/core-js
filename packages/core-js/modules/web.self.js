'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var call = require('../internals/function-call');
var defineBuiltInAccessor = require('../internals/define-built-in-accessor');
var DESCRIPTORS = require('../internals/descriptors');
var fails = require('../internals/fails');

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var INCORRECT_VALUE = globalThis.self !== globalThis;
var selfGlobalReceiver;

var validateReceiver = function (receiver) {
  if (receiver === undefined || receiver === null || receiver === selfGlobalReceiver) return globalThis;
  // approximate foreign globals by their Math
  if (receiver === globalThis || typeof receiver.Math == 'object') return receiver;
  throw new $TypeError('Illegal invocation');
};

// `self` getter
// https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-self
try {
  if (DESCRIPTORS) {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var descriptor = Object.getOwnPropertyDescriptor(globalThis, 'self');
    // some engines have `self`, but with incorrect descriptor or receiver checks
    // https://github.com/denoland/deno/issues/15765
    if (INCORRECT_VALUE || !descriptor || !descriptor.get || !descriptor.enumerable || !fails(function () {
      // Bun and Deno getters accept invalid receivers
      // https://github.com/oven-sh/bun/issues/47793
      // https://github.com/denoland/deno/issues/37119
      call(descriptor.get, {});
    })) {
      defineBuiltInAccessor(globalThis, 'self', {
        get: function self() {
          if (selfGlobalReceiver === undefined) selfGlobalReceiver = this;
          return validateReceiver(this);
        },
        set: function self(value) {
          defineProperty(validateReceiver(this), 'self', {
            value: value,
            writable: true,
            configurable: true,
            enumerable: true
          });
        },
        configurable: true,
        enumerable: true
      });
      // Node vm contexts may pass a different receiver; capture it during initialization
      // the assignment preserves the read when minifying
      selfGlobalReceiver = globalThis.self && selfGlobalReceiver;
    }
  } else $({ global: true, simple: true, forced: INCORRECT_VALUE }, {
    self: globalThis
  });
} catch (error) { /* empty */ }
