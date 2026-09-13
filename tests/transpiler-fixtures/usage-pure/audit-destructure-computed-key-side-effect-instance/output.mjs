import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref2;
// A computed instance key on an identifier receiver runs after receiver capture and before
// the single method read. A nullish receiver throws before the key effect can run.
const _ref = arr,
  m = null == _ref ? _ref[""] : (effectful(), _flatMaybeArray(_ref));
const probe = _includesMaybeArray(_ref2 = [1, 2]).call(_ref2, 2);