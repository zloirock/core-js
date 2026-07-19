import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
let c = 0;
const g = _globalThis;

// alias proxy root buried under a root side-effect sequence, pure-CTOR leaf: the whole nav whole-swaps
// to the pure ctor and harvests the effect (`(c++, g).self.Map` -> `c++, _Map`), not re-emitting the
// raw `.self` hop off the alias (undefined off-engine)
c++, _Map;
const viaRootSeCtor = _Map$groupBy;
export const a = viaRootSeCtor;

// alias root, root side-effect, NON-ctor leaf: the alias identifier stays and only the redundant hop drops
(c++, g).Array;
const viaRootSeStatic = _Array$from;
export const b = viaRootSeStatic;

// alias root with the side-effect buried in the hop TAIL, pure-ctor leaf: the ctor whole-swap sees
// through the tail sequence and collapses the same way
c++, _Promise;
const viaTailSeCtor = _Promise$allSettled;
export const d = viaTailSeCtor;

// alias root with the effect buried in the hop TAIL, NON-ctor leaf: the discarded residual is ownerless
// (no competing instance-dispatch rewrite), so the redundant hop still drops off the kept alias name
(c++, _globalThis).Array;
const viaTailSeStatic = _Array$of;
export const e = viaTailSeStatic;