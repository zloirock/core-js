// a monkey-patch of a static hidden inside a constructor parameter-property decorator must be
// detected so usage-pure does NOT receiver-less-substitute the patched static read over the user
// patch - the patched static stays raw and shares the patched constructor. the parser drops
// `decorators` from TSParameterProperty's visitor keys, so the scoped mutation pre-pass never
// descends into a param-property decorator unless it requeues them. a sibling NON-mutated static
// still substitutes, proving the bail is per-key, not whole-file
class C {
  constructor(@register(Object.assign(Array, { from: () => [] })) private p: number) {}
}
Array.from([1]);
Array.of(2);
