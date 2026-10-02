// The reader pairs its parameter with the second argument of this call.
function pick<T extends { rows: unknown }>(unused: unknown, o: T): T["rows"] {
  return o.rows;
}
const box = { rows: [8, 9] };
use(pick(0, box).at(-1));
