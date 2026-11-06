import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// an instance method nested one level into a selection the build decides behind an effect prefix: the
// level reads off the value the selection yields, so the leaf dispatches on that array as it does for
// the array spelled alone
const user = {};
const at = _atMaybeArray((eff(), [1]));
let flat;
eff();
flat = _flatMaybeArray([2]);
const includes = _includesMaybeArray((eff(), [3]));
export { at, flat, includes };