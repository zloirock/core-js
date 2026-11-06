import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// A computed instance key on an unchanged identifier receiver runs after its null test and before
// the single method read. A nullish receiver throws before the key effect can run.
const m = null == arr ? arr[""] : (effectful(), _flatMaybeArray(arr));
const probe = _includesMaybeArray(_ref = [1, 2]).call(_ref, 2);