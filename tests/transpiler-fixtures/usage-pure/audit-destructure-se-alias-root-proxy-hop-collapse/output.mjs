import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// A destructure off a realm navigation rooted at an alias of the realm, with an effect buried in a
// sequence at the root or inside the hops, runs the effect once ahead of the extraction and reads no
// raw hop off the alias (`self` is undefined where the engine has none): each static extracts from
// its own entry, whether its constructor has a ponyfill or core-js extends it in place.
let c = 0;
const g = _globalThis;
c++;
// effect at the root, a constructor with a ponyfill
const viaRootSeCtor = _Map$groupBy;
export const a = viaRootSeCtor;
c++;
// effect at the root, a constructor core-js extends in place
const viaRootSeStatic = _Array$from;
export const b = viaRootSeStatic;
c++;
// effect inside the hops, a constructor with a ponyfill
const viaTailSeCtor = _Promise$allSettled;
export const d = viaTailSeCtor;
c++;
// effect inside the hops, a constructor core-js extends in place
const viaTailSeStatic = _Array$of;
export const e = viaTailSeStatic;