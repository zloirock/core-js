// a provably-pure call root leaves NO effects to sink: the discarded receiver renders through the
// shared discarded-receiver decision instead of a verbatim clone (whose raw `.self` hop would
// throw at loop init off-engine) - a pure-ctor leaf whole-swaps, a native-static leaf re-roots
// at the pure global
let out5;
for (const { of } = (() => globalThis)().self.Array; !out5;) {
  out5 = typeof of;
}
export const r5 = [out5];
