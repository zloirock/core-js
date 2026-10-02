import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A non-null assertion cannot hide the named argument's opaque handout.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const box = {
  rows: [8, 9]
};
mutate(box);
use(pick(box!).at(-1));