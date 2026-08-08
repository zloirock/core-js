import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a chain-assign optional subject whose VALUE is a global-proxy navigation core-js PONYFILLS end to end:
// the SUBSTITUTION is what makes it always defined, so the source's own off-engine undefined says nothing
// and the `?.` is dead. both emitters drop it and collapse the span to the pure root; the redundant
// trailing hop over that root drops with it, since re-reading the hop off the memo would throw on engines
// without it. they differ only in how they spell the same global (leaf swap vs root collapse - one object
// either way).
// the twin whose value is NOT ponyfilled (`window`, its own fixture) is the opposite: nothing about the
// assigned value is guaranteed, so its guard is live and the span is kept. distinct methods per line.
let q;
export const viaSelfHop = _flatMaybeArray((q = _self, _globalThis).Array.prototype);

// a call through the tail keeps its receiver binding and drops the same trailing hop
let w;
export const viaSelfCallHop = _includesMaybeArray((w = _self, _globalThis).Array.prototype).call([1, 2], 2);

// definedness of a sequence value is decided by its TAIL: the prefix effect stays verbatim inside the
// assignment, the tail spells as the leaf ponyfill, and the guard is as dead as over the bare form
let e = 0;
let s;
export const viaSeqSelfValue = _atMaybeArray((s = (e++, _self), _globalThis).Array.prototype).call([1], 0);
export { e };

// a deeper all-ponyfilled navigation as the value: the leaf (`globalThis`) is the spelling
let d;
export const viaDeepPonyValue = _mapMaybeArray((d = _globalThis, _globalThis).Array.prototype).call([1], x => x);

// an UNRESOLVED method does not change the spelling: the chain still substitutes its ROOT, never the
// value leaf's own ponyfill - the call-rooted plan used to leak an assign-stored navigation through its
// object-name resolver, which peels assignments and reported the value's LEAF as the root
let u;
export const viaUnresolvedMethod = (u = _self, _globalThis).Array.prototype.lastIndexOf.call([1], 1);