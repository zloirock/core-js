import "core-js/modules/es.array.at";
// Reading a getter through a local helper preserves its returned array type.
function pick<T extends {
  rows: unknown;
}>(o: T): T["rows"] {
  return o.rows;
}
const box = {
  get rows() {
    effect();
    return [8, 9];
  }
};
use(pick(box).at(-1));