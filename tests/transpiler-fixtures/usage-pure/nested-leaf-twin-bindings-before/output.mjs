import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// The nested leaf keeps its local bindings after extraction before a residual.
const name = _nameMaybeFunction(APP_STATE.config);
const _ref2 = (_ref = APP_STATE.config.items) === void 0 ? [] : _ref;
const at = _at(_ref2);
const includes = _includes(_ref2);
use(() => [at, includes, name]);