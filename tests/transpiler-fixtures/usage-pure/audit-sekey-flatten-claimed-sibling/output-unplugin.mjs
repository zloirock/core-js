import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// a flatten-claimed declaration re-renders whole-range from per-declarator slots, so a sibling
// SE-key instance destructure must route its artifacts through the SAME slots: the value rename
// bakes into the residual slice, the receiver memo joins the slot extractions (before the
// residual), and the extracted pair trails its OWN declarator's residual (a later sibling may
// read the extracted name; the kept key effect runs first) - in EITHER declarator order, and in
// a for-init head
let k1 = 0;
var f1 = _Array$from;
var _ref = Array.prototype;
var { [(k1++, 'at')]: _unused, other1 } = _ref, a1 = _atMaybeArray(_ref);
export const r1 = [typeof f1, typeof a1, k1];
// SE-key declarator BEFORE the flatten declarator (the claim lands after the artifacts queue)
let k2 = 0;
var _ref2 = Array.prototype;
var { [(k2++, 'flat')]: _unused2, other2 } = _ref2, fl2 = _flatMaybeArray(_ref2);
var o2 = _Array$of;
export const r2 = [typeof fl2, typeof o2, k2];
// for-init head: the pair joins the comma list after the residual
let k3 = 0, out3 = '';
for (var { isArray: ia3 } = _globalThis.Array, _ref3 = Array.prototype, { [(k3++, 'includes')]: _unused3, o3 } = _ref3, inc3 = _includesMaybeArray(_ref3), i3 = 0; i3 < 1; i3++) {
  var _ref4;
  out3 = _joinMaybeArray(_ref4 = [typeof ia3, typeof inc3]).call(_ref4, ',');
}
export const r3 = [out3, k3];
// static SE-key sibling control (no memo channel involved)
let k4 = 0;
var f4 = _Array$from;
var of4 = _Array$of;
var { [(k4++, 'of')]: _unused4, other4 } = Array;
export const r4 = [typeof f4, typeof of4, k4];
// bodyless control host wraps in a block; TWO SE-key props share the slot (one memo, two
// renames, two trailing pairs - key effects in source order)
let k5 = 0, j5 = 0;
if (1) { var { keys: ks5 } = _globalThis.Array;
var _ref5 = Array.prototype;
var { [(k5++, 'at')]: _unused5, [(j5++, 'flat')]: _unused6, other5 } = _ref5, a5 = _atMaybeArray(_ref5), b5 = _flatMaybeArray(_ref5); }
export const r5 = [typeof ks5, typeof a5, typeof b5, k5, j5];