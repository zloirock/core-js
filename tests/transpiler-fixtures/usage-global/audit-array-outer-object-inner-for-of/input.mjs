// `for (const [{ x }] of items)` with `items: { x: T }[][]` - top-level findPatternIndex
// skips ObjectPattern elements, so the nested-pattern descent must walk the for-of element
// annotation via the key-path classifier. Distinct narrow methods (.at on the string field,
// .toFixed on a sibling number field) make per-slot narrowing observable: regression returns
// generic .at fallback emitting es.array.at alongside es.string.at, plus loses .toFixed narrow.
declare const rows: { name: string; age: number }[][];
for (const [{ name, age }] of rows) {
  name.at(0);
  age.toFixed(2);
}
