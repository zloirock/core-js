// TS-cast IIFE with non-null assertion wrapper `(arrow!)()` - distinct TS wrapper kind
// from `as any`. the peel set must cover the full TS_EXPR_WRAPPERS family uniformly
// (as / satisfies / non-null / type-assertion) so all flavors are recognised as IIFE
// callees consistently. without the peel, x.at(-1) over-injects array.at.
let x = [];
((() => {
  x = 'hello';
})!)();
x.at(-1);
