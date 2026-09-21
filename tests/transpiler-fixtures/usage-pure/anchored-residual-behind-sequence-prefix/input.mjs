// A sequence prefix runs once before a constructor residual is read.
// Assignments nested in that prefix keep their own effects and polyfills.
let eff = 0;
const { Array: { from: declFrom }, Set: { customQ: declUnion } } = (eff++, globalThis);
let from, customQ;
({ Array: { from }, Set: { customQ } } = (eff++, globalThis));
let inner;
({ Array: { from }, Set: { customQ } } = (({ Map: { groupBy: inner } } = globalThis), globalThis));
export { eff, declFrom, declUnion, from, customQ, inner };
