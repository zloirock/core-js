import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
var _ref;
// A non-nullish symbol key cannot overwrite a named array slot.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const key = _Symbol();
use(_atMaybeArray(_ref = pick({
  rows: [8, 9],
  [key]: "ab"
})).call(_ref, -1));