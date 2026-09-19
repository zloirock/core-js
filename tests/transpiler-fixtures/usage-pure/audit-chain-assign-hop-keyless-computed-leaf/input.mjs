// a chain-assign root navigating a proxy hop into a KEYLESS computed leaf: the hop-root
// collapse owns the whole span (assign folds, hop drops, the key stays raw) - the swallowed
// hop must not fire its own value-canon claim (a `.self` -> ponyfill swap racing the span),
// and a get-iterator leaf is owned by the instance dispatch that queued first
let x;
export const numericLeaf = (x = globalThis).self[0];
let y;
export const symbolIterator = (y = globalThis).self[Symbol.iterator];
let z;
let k;
export const dynamicKey = (z = globalThis).self[k];
// SE-bearing computed key stays in place after the collapsed receiver
let w;
let e = 0;
export const seKey = (w = globalThis).self[(e++, 0)];
// deeper hop run collapses the same way
let v;
export const deepHop = (v = globalThis).self.self[0];
// claimable-string control: the leaf claims through its own ponyfill, no collapse race
let c;
export const claimableLeaf = (c = globalThis).self['Set'];
// optional spellings deopt (a resolvable root's guard is dead; the hop value is always
// defined) and collapse identically
let oa;
export const optionalRoot = (oa = globalThis)?.self[0];
let ob;
export const optionalLeaf = (ob = globalThis).self?.[0];
// SE-bearing HOP key folds into the collapse sequence at its native slot
let oc;
let g = 0;
export const seHopKey = (oc = globalThis)[(g++, 'self')][0];
// a kept-window value drops the redundant hop and keeps the raw read (native throws in the
// same place where the value is absent)
let od;
export const keptWindowLeaf = (od = globalThis.window).self[0];
// host positions around the collapsed span: a computed WRITE key and a spread argument both
// consume the collapse in place; a proxy hop in a plain call-argument VALUE slot keeps its
// own leaf-ponyfill canon (the positional fall-through, not the hop exit)
let wa;
const box = {};
box[(wa = globalThis).self[0] ?? 'k'] = 1;
export const writeKeyHost = box;
let sa;
export const spreadHost = Math.max(...((sa = globalThis).self[0] ?? [0]));
let va;
export function keepValue(v) {
  return v;
}
export const valueArgSelf = keepValue((va = globalThis).self);
// user parens between the hop and the leaf: the anchor-edge peel sees through them, the
// collapse still owns the span (the wrapper survives as source cosmetics)
let pa;
export const parenBetween = ((pa = globalThis).self)[0];
