// A destructure off a realm navigation rooted at an alias of the realm, with an effect buried in a
// sequence at the root or inside the hops, runs the effect once ahead of the extraction and reads no
// raw hop off the alias (`self` is undefined where the engine has none): each static extracts from
// its own entry, whether its constructor has a ponyfill or core-js extends it in place.
let c = 0;
const g = globalThis;

// effect at the root, a constructor with a ponyfill
const { groupBy: viaRootSeCtor } = (c++, g).self.Map;
export const a = viaRootSeCtor;

// effect at the root, a constructor core-js extends in place
const { from: viaRootSeStatic } = (c++, g).self.Array;
export const b = viaRootSeStatic;

// effect inside the hops, a constructor with a ponyfill
const { allSettled: viaTailSeCtor } = (c++, g.self).Promise;
export const d = viaTailSeCtor;

// effect inside the hops, a constructor core-js extends in place
const { of: viaTailSeStatic } = (c++, g.self).Array;
export const e = viaTailSeStatic;
