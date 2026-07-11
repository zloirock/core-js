// a ctor-slot mutation through ONE global-proxy alias must be visible to reads through ANY
// other - the proxy names (`globalThis` / `self` / `window` / `global`) alias the same object
self.Set = function ShimSet() {};
window.Promise = function ShimPromise() {};
// destructure value read through a DIFFERENT alias honors the shim (raw proxy read)
const { Set } = globalThis;
export const s = new Set([1]);
// flat value read through a different alias honors the shim too
export const P = globalThis.Promise;
// reverse direction: `globalThis` mutation, read through `self`
globalThis.Map = function ShimMap() {};
const { Map: ReadMap } = self;
export const m = new ReadMap();
// unmutated ctor control beside the patched slots still substitutes
const { WeakMap } = globalThis;
export const w = new WeakMap();
// a delete through one alias keeps the in-check through another alias DYNAMIC (no fold)
delete self.Iterator;
export const has = 'Iterator' in globalThis;
// the reverse in-check direction stays dynamic through the same canonical key
delete globalThis.WeakSet;
export const hasW = 'WeakSet' in self;
// a COMPUTED const-alias key resolves into the same canonical-key check
const k = 'Iterator';
export const hasComputed = k in globalThis;
// the param-default mirror keeps the cross-alias mutated slot raw while the unmutated
// sibling still extracts
function read({ Set: S, Array: { of } } = globalThis) { return [new S(), of(1)]; }
export const mirrored = read();
