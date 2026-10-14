import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2;
// A static keyed by an effect between a member target and a plain slot, assigned off a probed `window` and
// off the realm: each leg keeps the source order, babel reading the constructor hop as a member while
// unplugin destructures it (the sidecar).
let f4, c4, f6, c6;
const o = {};
_ref = (null == _globalThis.window ? void 0 : _globalThis.window).Array, {
  isArray: o.g
} = _ref, e(), f4 = _Array$fromAsync, {
  custom: c4
} = _ref;
_ref2 = _globalThis.Array, {
  isArray: o.h
} = _ref2, e(), f6 = _Array$of, {
  custom: c6
} = _ref2;