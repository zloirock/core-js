import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref, _ref2, _ref3;
// non-bare optional root `a.b?.c` feeds two non-optional polyfilled hops; the inner hop must
// read the memoized root (`_ref.c`) instead of re-evaluating `a.b` and reading through a
// now-nullish prefix
null == (_ref = a.b) ? void 0 : _flatMaybeArray(_ref2 = _sliceMaybeArray(_ref3 = _ref.c).call(_ref3, 1)).call(_ref2, 2);