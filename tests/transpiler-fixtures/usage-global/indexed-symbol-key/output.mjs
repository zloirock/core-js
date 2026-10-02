import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
// A non-nullish symbol key cannot overwrite a named array slot.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const key = Symbol();
use(pick({
  rows: [8, 9],
  [key]: "ab"
}).at(-1));