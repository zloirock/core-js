import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref20, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref30, _ref31, _ref32, _ref33, _ref34, _ref35, _ref36, _ref37, _ref38, _ref39, _ref40, _ref41, _ref42;
// stacked combined dispatches over a probed root: each dispatch reads its receiver plainly past the
// link below it, so the root's probe, the static claim's ponyfill read and every lookup compose into
// ONE test in evaluation order - the build used to abort with a guard prefix stranded between nested
// guards. the dead root memo that composition leaves unwraps bare, as the AST leg prints it
let w;
export const plain = null == _globalThis.window || null == (_ref = _flatMaybeArray(_ref2 = _Array$of(6))) || null == (_ref3 = _mapMaybeArray(_ref4 = _ref.call(_ref2))) || null == (_ref5 = _atMaybeArray(_ref6 = _ref3.call(_ref4, x => x))) ? void 0 : _flatMaybeArray(_ref7 = _ref5.call(_ref6, 0))?.call(_ref7);
export const hops = null == _globalThis.window || null == (_ref8 = _flatMaybeArray(_ref9 = _Array$of(6))) || null == (_ref10 = _mapMaybeArray(_ref11 = _ref8.call(_ref9))) || null == (_ref12 = _atMaybeArray(_ref13 = _ref10.call(_ref11, x => x))) ? void 0 : _flatMaybeArray(_ref14 = _ref12.call(_ref13, 0))?.call(_ref14);
export const deeper = null == _globalThis.window || null == (_ref15 = _flatMaybeArray(_ref16 = _Array$of(6))) || null == (_ref17 = _mapMaybeArray(_ref18 = _ref15.call(_ref16))) || null == (_ref19 = _atMaybeArray(_ref20 = _ref17.call(_ref18, x => {
  var _ref21;
  return _atMaybeArray(_ref21 = [x]).call(_ref21, 0);
}))) || null == (_ref22 = _flatMaybeArray(_ref23 = _ref19.call(_ref20, 0))) ? void 0 : _at(_ref24 = _ref22.call(_ref23))?.call(_ref24, 0);
export const kept = null == (w = _globalThis.window) || null == (_ref25 = _flatMaybeArray(_ref26 = _Array$of(6))) || null == (_ref27 = _mapMaybeArray(_ref28 = _ref25.call(_ref26))) || null == (_ref29 = _atMaybeArray(_ref30 = _ref27.call(_ref28, x => x))) || null == (_ref31 = _flatMaybeArray(_ref32 = _ref29.call(_ref30, 0))) ? void 0 : _mapMaybeArray(_ref33 = _ref31.call(_ref32))?.call(_ref33, y => y);
export const staticRoot = null == _globalThis.window || null == (_ref34 = _flatMaybeArray(_ref35 = _Array$from([1]))) || null == (_ref36 = _mapMaybeArray(_ref37 = _ref34.call(_ref35))) || null == (_ref38 = _atMaybeArray(_ref39 = _ref36.call(_ref37, x => x))) || null == (_ref40 = _flatMaybeArray(_ref41 = _ref38.call(_ref39, 0))) ? void 0 : _keys(_ref42 = _ref40.call(_ref41))?.call(_ref42);