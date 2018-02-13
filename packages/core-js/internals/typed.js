var global = require('../internals/global');
var hide = require('../internals/hide');
var uid = require('../internals/uid');
var TYPED = uid('typed_array');
var VIEW = uid('view');
var ABV = !!(global.ArrayBuffer && global.DataView);
var CONSTR = ABV;
var Typed;

var TypedArrayConstructors = {
  Int8Array: 1,
  Uint8Array: 1,
  Uint8ClampedArray: 1,
  Int16Array: 1,
  Uint16Array: 1,
  Int32Array: 1,
  Uint32Array: 1,
  Float32Array: 1,
  Float64Array: 1
};

for (var name in TypedArrayConstructors) {
  if (Typed = global[name]) {
    hide(Typed.prototype, TYPED, true);
    hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

module.exports = {
  ABV: ABV,
  CONSTR: CONSTR,
  TYPED: TYPED,
  VIEW: VIEW
};
