import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A bodyless signature cannot prove that the named argument stays confined.
declare function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"];
const box = {
  rows: [8, 9]
};
use(pick(box).at(-1));