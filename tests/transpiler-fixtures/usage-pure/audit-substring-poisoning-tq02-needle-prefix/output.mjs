import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5;
// identifier `_ref10` contains `_ref` as substring within the transform-queue search
// range. multiple chained polyfills produce `_ref`, `_ref2`, ..., `_ref10` UIDs in the
// same scope. nth-occurrence math must not match `_ref` inside `_ref10` when looking
// for the 10th `_ref` - the search counts whole-identifier hits via the original source
// slice (which carries no bindings yet). cover via 3 different chained instance methods
// so each emits a distinct import and any miss is visible per-line
const a = _at(_ref = _flatMaybeArray(arr).call(arr)).call(_ref, -1);
const b = _includes(_ref2 = _at(_ref3 = _flatMaybeArray(arr).call(arr)).call(_ref3, -1)).call(_ref2, 1);
const c = _includes(_ref4 = _at(_ref5 = _flatMaybeArray(arr).call(arr)).call(_ref5, -1)).call(_ref4, 2).toString();