import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
// usage-pure optional CALL on a polyfillable static via a computed string key, different static
// (`Array["of"]?.(x).flat()`): the dead `?.` on the always-defined static must be owned by the
// static visitor, not claimed and deopted by the instance transform. regression lock
function f(x) {
  var _ref;
  return _flatMaybeArray(_ref = _Array$of(x)).call(_ref);
}
f;