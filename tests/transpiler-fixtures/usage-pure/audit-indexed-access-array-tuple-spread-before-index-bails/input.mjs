// a spread at or before the target index shifts the runtime position of subsequent elements by an
// unknown amount, so the element at that AST index no longer corresponds to the runtime slot - static
// index extraction must bail to the constraint (here `unknown`) -> generic polyfill
declare const rest: Array<{ items: string }>;
function first<T extends [unknown, unknown]>(t: T): T[1] {
  return t[1];
}
const r = first([{ items: [1, 2, 3] }, ...rest]);
r.items.at(-1);
