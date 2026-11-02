import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Replacing the whole nested pattern must not leave bindings on its old identifiers.
const {
    config: {
      items: _ref = []
    }
  } = APP_STATE,
  at = _at(_ref),
  includes = _includes(_ref);
use(() => [at, includes]);