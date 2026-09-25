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
var {
    Array: {
      from: f1
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  _ref = Array.prototype,
  a1 = null == _ref ? _ref[""] : (k1++, _atMaybeArray(_ref)),
  {
    other1
  } = _ref;
export const r1 = [typeof f1, typeof a1, k1];
// The same rule holds when the computed-key declarator precedes the nested static.
let k2 = 0;
var _ref2 = Array.prototype,
  fl2 = null == _ref2 ? _ref2[""] : (k2++, _flatMaybeArray(_ref2)),
  {
    other2
  } = _ref2,
  {
    Array: {
      of: o2
    }
  } = {
    Array: {
      of: _Array$of
    }
  };
export const r2 = [typeof fl2, typeof o2, k2];
// A for-init header keeps the key and instance binding before later declarators.
let k3 = 0,
  out3 = '';
for (var {
    isArray: ia3
  } = _globalThis.Array, _ref3 = Array.prototype, inc3 = null == _ref3 ? _ref3[""] : (k3++, _includesMaybeArray(_ref3)), {
    o3
  } = _ref3, i3 = 0; i3 < 1; i3++) {
  var _ref4;
  out3 = _joinMaybeArray(_ref4 = [typeof ia3, typeof inc3]).call(_ref4, ',');
}
export const r3 = [out3, k3];
// A computed static key also runs before its selected binding and ordinary sibling read.
let k4 = 0;
var {
    Array: {
      from: f4
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  _ref5 = Array,
  of4 = (k4++, _Array$of),
  {
    other4
  } = _ref5;
export const r4 = [typeof f4, typeof of4, k4];
// A bodyless declaration keeps both computed keys and their method reads inside the condition,
// with one receiver evaluation and source order preserved.
let k5 = 0,
  j5 = 0;
if (1) var {
    keys: ks5
  } = _globalThis.Array,
  _ref6 = Array.prototype,
  a5 = null == _ref6 ? _ref6[""] : (k5++, _atMaybeArray(_ref6)),
  _ref7 = _ref6,
  b5 = null == _ref7 ? _ref7[""] : (j5++, _flatMaybeArray(_ref7)),
  {
    other5
  } = _ref6;
export const r5 = [typeof ks5, typeof a5, typeof b5, k5, j5];