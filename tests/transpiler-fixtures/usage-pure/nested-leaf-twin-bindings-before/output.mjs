import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// The nested leaf keeps its local bindings after extraction before a residual.
const {
    config: _ref
  } = APP_STATE,
  {
    items: _ref2 = []
  } = _ref,
  at = _at(_ref2),
  includes = _includes(_ref2),
  name = _nameMaybeFunction(_ref);
use(() => [at, includes, name]);