import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Several instance leaves share the default receiver's single evaluation.
// The default runs only when the outer slot is undefined.
let calls = 0;
function make() {
  calls++;
  return [1, [2]];
}
const {
    A: _ref = make()
  } = {},
  at = _atMaybeArray(_ref),
  flat = _flatMaybeArray(_ref);
console.log(at, flat, calls);