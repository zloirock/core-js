// an assignment-form ctor alias narrows statics once the registered write dominates the read
let M;
({ Map: M } = globalThis);
export const a = M.groupBy(items, keyFn);

// NEGATIVE: an alias hop CAPTURES its source before the aliasing write - the registered span
// gate must anchor at the hop declarator, where the source still holds undefined
let M2;
const HopBefore = M2;
({ Map: M2 } = globalThis);
export const b = HopBefore.groupBy(items, keyFn);

// the same hop AFTER the write reads the live constructor - narrows like the direct form
let M3;
({ Map: M3 } = globalThis);
const HopAfter = M3;
export const c = HopAfter.groupBy(items, keyFn);

// NEGATIVE: a proxy-global alias hop captured before the aliasing write reads undefined -
// the hop must not collapse to the pure global surface
let g;
const sBefore = g;
({ self: g } = globalThis);
export const d = sBefore.Array.from(items);

// the post-write proxy hop re-enters the live global surface and collapses
let g2;
({ self: g2 } = globalThis);
const sAfter = g2;
export const e = sAfter.Array.from(items);

// a direct read before the aliasing write keeps the RUNTIME ctor guard: the pre-write
// read falls to the raw member and throws natively, the post-write path gets the polyfill
let M4;
export const f = M4.groupBy(items, keyFn);
({ Map: M4 } = globalThis);

// a block-scoped ctor alias serves only its block: the same-named read AFTER the block is a
// runtime ReferenceError the registration must not narrow; a hoisted `var` twin serves the
// whole function
{
  let { Set: BlockScoped } = globalThis;
  export_.inBlock = BlockScoped.union;
}
export const i = BlockScoped.union;
{
  var { WeakMap: HoistedTwin } = globalThis;
}
export const j = HoistedTwin.getOrInsert;

// a NON-global pattern slot off the proxy surface is a plain property read (`globalThis.x`,
// likely undefined) - classifying it as the proxy root would un-throw the native failure;
// a proxy-global-NAMED slot legitimately re-enters the surface and collapses
const { x: plainSlot } = globalThis;
export const k = plainSlot.Array.from(items);
const { self: reentry } = globalThis;
export const l = reentry.Promise.allSettled(items);
