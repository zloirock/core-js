import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
var _ref;
// The nested leaf keeps its local bindings after extraction behind a residual.
const name = _nameMaybeFunction(APP_STATE.config);
const _ref2 = (_ref = APP_STATE.config.filters) === void 0 ? {} : _ref;
const keys = _keys(_ref2);
const values = _values(_ref2);
use(() => [keys, values, name]);