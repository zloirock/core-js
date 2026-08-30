import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref19, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref30, _ref31, _ref32, _ref33, _ref34;
// three guarded producers nested in one chain: the inner claim's guard (the root's own polyfill)
// sits UNDER the test of a combined chain that is itself a guarded producer under another one. the
// owner's inners compose into it before its guard prefix hoists, so the claim lands in the test it
// belongs to rather than being carried off raw with the prefix - the build used to abort with the
// prefix stranded. the dead root memo that composition leaves unwraps bare, as the AST leg prints it
let w;
export const plain = null == (_ref = null == (_ref2 = null == _globalThis.window ? void 0 : _Array$of(6)) || null == (_ref3 = _flatMaybeArray(_ref2)) ? void 0 : _mapMaybeArray(_ref4 = _ref3.call(_ref2))?.call(_ref4, x => x)) || null == (_ref5 = _atMaybeArray(_ref)) ? void 0 : _flatMaybeArray(_ref6 = _ref5.call(_ref, 0))?.call(_ref6);
export const hops = null == (_ref7 = null == (_ref8 = null == _globalThis.window ? void 0 : _Array$of(6)) || null == (_ref9 = _flatMaybeArray(_ref8)) ? void 0 : _mapMaybeArray(_ref10 = _ref9.call(_ref8))?.call(_ref10, x => x)) || null == (_ref11 = _atMaybeArray(_ref7)) ? void 0 : _flatMaybeArray(_ref12 = _ref11.call(_ref7, 0))?.call(_ref12);
export const deeper = null == (_ref13 = null == (_ref14 = null == _globalThis.window ? void 0 : _flatMaybeArray(_ref15 = _Array$of(6))?.call(_ref15)) || null == (_ref16 = _mapMaybeArray(_ref14)) ? void 0 : _atMaybeArray(_ref17 = _ref16.call(_ref14, x => {
  var _ref18;
  return _atMaybeArray(_ref18 = [x]).call(_ref18, 0);
}))?.call(_ref17, 0)) || null == (_ref19 = _flatMaybeArray(_ref13)) ? void 0 : _at(_ref20 = _ref19.call(_ref13))?.call(_ref20, 0);
export const kept = null == (_ref21 = null == (_ref22 = null == (w = _globalThis.window) ? void 0 : _flatMaybeArray(_ref23 = _Array$of(6))?.call(_ref23)) || null == (_ref24 = _mapMaybeArray(_ref22)) ? void 0 : _atMaybeArray(_ref25 = _ref24.call(_ref22, x => x))?.call(_ref25, 0)) || null == (_ref26 = _flatMaybeArray(_ref21)) ? void 0 : _mapMaybeArray(_ref27 = _ref26.call(_ref21))?.call(_ref27, y => y);
export const staticRoot = null == (_ref28 = null == (_ref29 = null == _globalThis.window ? void 0 : _flatMaybeArray(_ref30 = _Array$from([1]))?.call(_ref30)) || null == (_ref31 = _mapMaybeArray(_ref29)) ? void 0 : _atMaybeArray(_ref32 = _ref31.call(_ref29, x => x))?.call(_ref32, 0)) || null == (_ref33 = _flatMaybeArray(_ref28)) ? void 0 : _keys(_ref34 = _ref33.call(_ref28))?.call(_ref34);