import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5;
// optional call on a non-polyfilled method, followed by plain member hops, then a polyfilled
// instance method: `recv.m?.().x.at(-1)`. the optional-call body collapses to `_ref.call(recv)`,
// so the intermediate member tail (`.x`, `.rows`) must be spliced back on - otherwise the
// polyfill reads off the bare call result and the hop is silently dropped. a side-effecting
// receiver (`getRec()`) is memoized once into its own ref
null == (_ref = obj.m) ? void 0 : _at(_ref2 = _ref.call(obj).x).call(_ref2, -1);
null == (_ref3 = getRec(), _ref4 = _ref3.m) ? void 0 : _flatMaybeArray(_ref5 = _ref4.call(_ref3).rows).call(_ref5);