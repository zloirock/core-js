// the nested-value gate that drives proxy-global mirror detection is ObjectPattern-only by design.
// `{ Array: { from } }` (OBJECT value) destructures the static `Array.from` -> substitutes `_Array$from`.
// `{ Array: [{ from }] }` (ARRAY value) destructures `globalThis.Array` AS AN ARRAY, so its `from` is
// `Array[0].from` (NOT the static `Array.from`) and must stay native - the gate is array-blind so it
// never mistakes the array-element receiver chain for the static-method receiver and over-injects.
// both sit in a param-default off a proxy global, the position the delta gate was added for
const g = globalThis;
function objVal({ Array: { from } } = g) {
  return from;
}
function arrVal({ Array: [{ from }] } = g) {
  return from;
}
export const out = [objVal(), arrVal()];
