import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// an instance method nested in an array element of a selection the build decides behind an effect
// prefix: each level reads off the value the selection yields, so the leaf dispatches on that array as
// it does for the array spelled alone
const user = {};
const [[_ref]] = [(eff(), [[1]])];
const at = _atMaybeArray(_ref);
const [[_ref2]] = [(eff(), [[2]])];
const flat = _flatMaybeArray(_ref2);
const [[_ref3]] = [(eff(), [[3]] || [user])];
const includes = _includesMaybeArray(_ref3);
export { at, flat, includes };