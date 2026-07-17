import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// an assignment-form ctor alias narrows statics once the registered write dominates the read
let M;
M = _Map;
export const a = _Map$groupBy(items, keyFn);

// NEGATIVE: an alias hop CAPTURES its source before the aliasing write - the registered span
// gate must anchor at the hop declarator, where the source still holds undefined
let M2;
const HopBefore = M2;
M2 = _Map;
export const b = HopBefore.groupBy(items, keyFn);

// the same hop AFTER the write reads the live constructor - narrows like the direct form
let M3;
M3 = _Map;
const HopAfter = M3;
export const c = _Map$groupBy(items, keyFn);

// NEGATIVE: a proxy-global alias hop captured before the aliasing write reads undefined -
// the hop must not collapse to the pure global surface
let g;
const sBefore = g;
g = _self;
export const d = sBefore.Array.from(items);

// the post-write proxy hop re-enters the live global surface and collapses
let g2;
g2 = _self;
const sAfter = g2;
export const e = _Array$from(items);

// a direct read before the aliasing write keeps the RUNTIME ctor guard: the pre-write
// read falls to the raw member and throws natively, the post-write path gets the polyfill
let M4;
export const f = (M4 === _Map ? _Map$groupBy : M4.groupBy.bind(M4))(items, keyFn);
M4 = _Map; // a block-scoped ctor alias serves only its block: the same-named read AFTER the block is a
// runtime ReferenceError the registration must not narrow; a hoisted `var` twin serves the
// whole function
{
  let BlockScoped = _Set;
  export_.inBlock = _Set.union;
}
export const i = BlockScoped.union;
{
  var HoistedTwin = _WeakMap;
}
export const j = _WeakMap.getOrInsert;

// a NON-global pattern slot off the proxy surface is a plain property read (`globalThis.x`,
// likely undefined) - classifying it as the proxy root would un-throw the native failure;
// a proxy-global-NAMED slot legitimately re-enters the surface and collapses
const {
  x: plainSlot
} = _globalThis;
export const k = plainSlot.Array.from(items);
const reentry = _self;
export const l = _Promise$allSettled(items);