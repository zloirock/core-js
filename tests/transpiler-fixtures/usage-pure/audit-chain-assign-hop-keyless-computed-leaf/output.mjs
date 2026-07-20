import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// a chain-assign root navigating a proxy hop into a KEYLESS computed leaf: the hop-root
// collapse owns the whole span (assign folds, hop drops, the key stays raw) - the swallowed
// hop must not fire its own value-canon claim (a `.self` -> ponyfill swap racing the span),
// and a get-iterator leaf is owned by the instance dispatch that queued first
let x;
export const numericLeaf = (x = _globalThis, _globalThis)[0];
let y;
export const symbolIterator = _getIteratorMethod((y = _globalThis, _globalThis));
let z;
let k;
export const dynamicKey = (z = _globalThis, _globalThis)[k];
// SE-bearing computed key stays in place after the collapsed receiver
let w;
let e = 0;
export const seKey = (w = _globalThis, _globalThis)[e++, 0];
// deeper hop run collapses the same way
let v;
export const deepHop = (v = _globalThis, _globalThis)[0];
// claimable-string control: the leaf claims through its own ponyfill, no collapse race
let c;
export const claimableLeaf = (c = _globalThis, _Set);
// optional spellings deopt (a resolvable root's guard is dead; the hop value is always
// defined) and collapse identically
let oa;
export const optionalRoot = (oa = _globalThis, _globalThis)[0];
let ob;
export const optionalLeaf = (ob = _globalThis, _globalThis)[0];
// SE-bearing HOP key folds into the collapse sequence at its native slot
let oc;
let g = 0;
export const seHopKey = (oc = _globalThis, g++, _globalThis)[0];
// a kept-window value drops the redundant hop and keeps the raw read (native throws in the
// same place where the value is absent)
let od;
export const keptWindowLeaf = (od = _globalThis.window)[0];
// host positions around the collapsed span: a computed WRITE key and a spread argument both
// consume the collapse in place; a proxy hop in a plain call-argument VALUE slot keeps its
// own leaf-ponyfill canon (the positional fall-through, not the hop exit)
let wa;
const box = {};
box[(wa = _globalThis, _globalThis)[0] ?? 'k'] = 1;
export const writeKeyHost = box;
let sa;
export const spreadHost = Math.max(...((sa = _globalThis, _globalThis)[0] ?? [0]));
let va;
export function keepValue(v) {
  return v;
}
export const valueArgSelf = keepValue((va = _globalThis, _self));
// user parens between the hop and the leaf: the anchor-edge peel sees through them, the
// collapse still owns the span (the wrapper survives as source cosmetics)
let pa;
export const parenBetween = (pa = _globalThis, _globalThis)[0];