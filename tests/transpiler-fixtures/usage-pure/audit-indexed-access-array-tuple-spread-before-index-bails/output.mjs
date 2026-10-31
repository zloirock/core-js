import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a spread at or before the target index shifts the runtime position of subsequent elements by an
// unknown amount, so the element at that AST index no longer corresponds to the runtime slot - static
// index extraction must bail to the constraint (here `unknown`) -> generic polyfill
declare const rest: Array<{
  items: string;
}>;
function first<T extends [unknown, unknown]>(t: T): T[1] {
  return t[1];
}
// @ts-expect-error a spread argument tsc cannot place is the shape under test
const r = first([{
  items: [1, 2, 3]
}, ...rest]);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_at(_ref = r.items).call(_ref, -1);