var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';

/*
  options.target - name of the target object
  options.global - target is the global object
  options.stat   - export as static methods of target
  options.proto  - export as prototype methods of target
  options.real   - real prototype method for the `pure` version
  options.forced - export even if the native feature is available
  options.bind   - bind methods to the target, required for the `pure` version
  options.wrap   - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe - use the simple assignment of property instead of delete + defineProperty
*/
module.exports = function (options, source) {
  var name = options.target;
  var GLOBAL = options.global;
  var PROTO = options.proto;
  var exports = GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = GLOBAL ? global : options.stat ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  for (key in source) {
    // contains in native
    own = !options.forced && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : options.bind && own ? ctx(out, global)
    // wrap global constructors for prevent change them in the `pure` version
    : options.wrap && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (options.real && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
