// a monkey-patch of a static hidden inside a constructor param-property decorator must be detected
// so usage-pure does NOT receiver-less-substitute that patched static read; it stays raw and shares
// the patched constructor. `decorators` is absent from TSParameterProperty's visitor keys, so the
// mutation pre-pass must requeue them; a sibling NON-mutated static still substitutes (bail per-key)
class C {
  constructor(@register(Object.assign(Array, { from: () => [] })) private p: number) {}
}
Array.from([1]);
Array.of(2);
