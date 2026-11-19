import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// An assignment claim keeps its effectful slot in the original assignment before both method reads.
let at, flat;
({
  value: _ref
} = {
  value: (record(), [1])
});
at = _atMaybeArray(_ref), flat = _flatMaybeArray(_ref);
export { at, flat };