// TS-cast IIFE with non-null assertion wrapper `(arrow!)()` - distinct TS wrapper kind
// from `as any`. the peel set must cover the full TS expression wrappers family uniformly
// (as / satisfies / non-null / type-assertion) so all flavors are recognised as IIFE
// callees consistently. without the peel, x.at(-1) over-injects array.at.
let x = [];
((() => {
  // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
  x = 'hello';
})!)();
x.at(-1);
