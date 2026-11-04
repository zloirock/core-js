import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
// The nested leaf keeps its local bindings after extraction behind a residual.
const _ref = APP_STATE.config,
  name = _nameMaybeFunction(_ref),
  {
    filters: _ref2 = {}
  } = _ref,
  keys = _keys(_ref2),
  values = _values(_ref2);
use(() => [keys, values, name]);