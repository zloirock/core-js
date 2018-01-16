var global = require('./_global');
var redefine = require('./_redefine');

var $export = function (type, name, source) {
  var FORCED = type & $export.F;
  var GLOBAL = type & $export.G;
  var STATIC = type & $export.S;
  var UNSAFE = type & $export.U;
  var target, key;
  if (GLOBAL) {
    source = name;
    target = global;
  } else if (STATIC) {
    target = global[name] || (global[name] = {});
  } else {
    target = (global[name] || {}).prototype;
  }
  if (target) for (key in source) {
    // contains in native
    if (!FORCED && target[key] !== undefined) continue;
    // extend global
    redefine(target, key, source[key], UNSAFE);
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
