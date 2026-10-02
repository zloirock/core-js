import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// TypeScript wrappers preserve the writes visible through the named argument.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const box: any = {
  rows: [8, 9]
};
box.rows = "ab";
use(pick(box as typeof box).at(-1));