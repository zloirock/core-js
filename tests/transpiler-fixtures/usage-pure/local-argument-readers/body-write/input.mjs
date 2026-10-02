// A reader that writes its parameter keeps the conservative family fallback.
function pick<T extends { rows: unknown }>(o: T): T["rows"] {
  o.rows = "ab";
  return o.rows;
}
const box = { rows: [8, 9] };
use(pick(box).at(-1));
