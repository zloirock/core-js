import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A closed caller census proves every invocation uses the inert array default.
// Both usage methods select only the array family.
function f(_ref = [[1, 2]][0]) {
  let at = _atMaybeArray(_ref);
  return at;
}
use(f().call([3, 4], -1));