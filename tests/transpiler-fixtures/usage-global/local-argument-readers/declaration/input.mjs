// A local property reader preserves the named argument's array type.
function pick<T extends { rows: unknown }>(o: T): T["rows"] {
  return o.rows;
}
const box = { rows: [8, 9] };
use(pick(box).at(-1));
