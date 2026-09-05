// a multi-prop ctor-hop pattern whose init carries a SEQUENCE PREFIX still re-anchors its residual on
// the pure constructor: the prefix lifts to its own statement on every host, so what the residual
// reads is the quiet tail - the same init its prefix-less twin anchors on - and never the proxy root's
// native slot. a destructure host buried in that prefix flattens ahead of it
let eff = 0;
const { Array: { from: declFrom }, Set: { union: declUnion } } = (eff++, globalThis);
let from, union;
({ Array: { from }, Set: { union } } = (eff++, globalThis));
let inner;
({ Array: { from }, Set: { union } } = (({ Map: { groupBy: inner } } = globalThis), globalThis));
export { eff, declFrom, declUnion, from, union, inner };
