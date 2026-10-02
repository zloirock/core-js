// Callee aliases retain the local reader's parameter proof.
const read = function <T extends { rows: unknown }>(o: T): T["rows"] {
  return o.rows;
};
const pick = read;
const box = { rows: [8, 9] };
use(pick(box).at(-1));
