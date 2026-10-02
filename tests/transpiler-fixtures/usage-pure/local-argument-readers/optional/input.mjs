// Optional calls and parentheses keep the same local reader and argument.
function pick<T extends { rows: unknown }>(o: T): T["rows"] {
  return o.rows;
}
const box = { rows: [8, 9] };
use(((pick))?.(((box as typeof box))).at(-1));
