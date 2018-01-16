var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var FORCED = type & $export.F;
  var GLOBAL = type & $export.G;
  var STATIC = type & $export.S;
  var PROTO = type & $export.P;
  var BIND = type & $export.B;
  var WRAP = type & $export.W;
  var REAL_PROTO = type & $export.R;
  var exports = GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = GLOBAL ? global : STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in the `pure` version
    : WRAP && target[key] == out ? (function (C) {
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
      if (REAL_PROTO && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};

// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // unsafe
$export.R = 128; // real proto method for the `pure` version

module.exports = $export;
