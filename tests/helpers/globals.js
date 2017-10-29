'use strict';
var global = Function('return this')();
global.global = global;
global.DESCRIPTORS = !!function () {
  try {
    return 7 === Object.defineProperty({}, 'a', {
      get: function () {
        return 7;
      }
    }).a;
  } catch (e) { /* empty */ }
}();
global.STRICT = !function () { return this; }();
global.PROTO = !!Object.setPrototypeOf || '__proto__' in Object.prototype;
global.NATIVE = false;
