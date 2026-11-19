import "core-js/modules/es.array.at";
// A computed getter and trailing setter retain one accessor descriptor during indexed substitution.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const key = "rows";
use(pick({
  get [key]() {
    return [8, 9];
  },
  set rows(value) {}
}).at(-1));