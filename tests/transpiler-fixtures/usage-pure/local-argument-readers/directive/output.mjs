import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// An inert directive preserves the local property reader in both parser dialects.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  "use strict";

  return o.rows;
}
const box = {
  rows: [8, 9]
};
use(_atMaybeArray(_ref = pick(box)).call(_ref, -1));