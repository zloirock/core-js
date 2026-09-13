import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A nested static declarator and a computed-key instance declarator keep their source slots.
// Each key precedes its selected method read, and later siblings see the completed bindings,
// in either declarator order and in a for-init header.
let k1 = 0;
var f1 = _Array$from;
var _ref = Array.prototype;
var _ref2 = _ref;
var a1 = null == _ref2 ? _ref2[""] : (k1++, _atMaybeArray(_ref2));
var {
  other1
} = _ref;
export const r1 = [typeof f1, typeof a1, k1];
// The same rule holds when the computed-key declarator precedes the nested static.
let k2 = 0;
var _ref3 = Array.prototype;
var _ref4 = _ref3;
var fl2 = null == _ref4 ? _ref4[""] : (k2++, _flatMaybeArray(_ref4));
var {
  other2
} = _ref3;
var o2 = _Array$of;
export const r2 = [typeof fl2, typeof o2, k2];
// A for-init header keeps the key and instance binding before later declarators.
let k3 = 0,
  out3 = '';
for (var {
    isArray: ia3
  } = _globalThis.Array, _ref5 = Array.prototype, _ref6 = _ref5, inc3 = null == _ref6 ? _ref6[""] : (k3++, _includesMaybeArray(_ref6)), {
    o3
  } = _ref5, i3 = 0; i3 < 1; i3++) {
  var _ref7;
  out3 = _joinMaybeArray(_ref7 = [typeof ia3, typeof inc3]).call(_ref7, ',');
}
export const r3 = [out3, k3];
// A computed static key also runs before its selected binding and ordinary sibling read.
let k4 = 0;
var f4 = _Array$from;
var _ref8 = Array;
var of4 = null == _ref8 ? _ref8[""] : (k4++, _Array$of);
var {
  other4
} = _ref8;
export const r4 = [typeof f4, typeof of4, k4];
// A bodyless declaration keeps both computed keys and their method reads inside the condition,
// with one receiver evaluation and source order preserved.
let k5 = 0,
  j5 = 0;
if (1) var {
    keys: ks5
  } = _globalThis.Array,
  _ref9 = Array.prototype,
  _ref10 = _ref9,
  a5 = null == _ref10 ? _ref10[""] : (k5++, _atMaybeArray(_ref10)),
  _ref11 = _ref9,
  b5 = null == _ref11 ? _ref11[""] : (j5++, _flatMaybeArray(_ref11)),
  {
    other5
  } = _ref9;
export const r5 = [typeof ks5, typeof a5, typeof b5, k5, j5];