import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Indexed return substitution keeps a named argument conservative after an opaque handout.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const box = {
  rows: [8, 9]
};
mutate(box);
use(pick(box).at(-1));