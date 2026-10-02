import "core-js/modules/es.array.at";
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
use(pick(box).at(-1));