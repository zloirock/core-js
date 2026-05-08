import _Array$from from "@core-js/pure/actual/array/from";
import _keys from "@core-js/pure/actual/instance/keys";
import _Map from "@core-js/pure/actual/map/constructor";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// Chain-assignment receiver `(a = Array).from(...)` must keep the assignment as an observable side effect
// even when the static dispatch drops the receiver in favour of the polyfill import.
// Three shapes cover static-drop, instance-memoize, and plain-literal paths in one fixture.
const r = (a = Array, _Array$from)([1]);
const s = _keys(_ref = b = _Map).call(_ref);
const t = _includesMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, 2);
[r, s, t];