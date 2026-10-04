import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// runtime-transparent WRAPPERS between a kept proxy root and its navigation. they carry no runtime meaning,
// so each shape must come out exactly like its bare twin: the assignment stays as the root, the redundant
// proxy hop drops, the guard survives. the climb that finds the collapse target has to peel to the same
// depth its anchor sits at - a chain-assign anchor IS an assignment, so a descent that peels through
// assignments walks past it and the climb dies on the first wrapper, leaving the hop raw.
// a cast around the root, a non-null assertion, plain parens, and a wrapper mid-chain. distinct methods.
let a;
export const throughCast = null == (a = _globalThis.window) ? void 0 : _flatMaybeArray(a.Array.prototype).call([1, [2]]);
let b;
export const throughNonNull = null == (b = _globalThis.window) ? void 0 : _atMaybeArray(b.Array.prototype).call([1], 0);
let c;
export const throughParens = null == (c = _globalThis.window) ? void 0 : _includesMaybeArray(c.Array.prototype).call([1], 1);

// a cast seal MID-CHAIN ends the chain there: the read above it observes the sealed value and
// throws, so the dropped hop's `?.` may not be re-hung on the leaf that now reads off the root
let d;
export const wrapperMidChain = _findLastMaybeArray((d = _globalThis.window).Array.prototype).call([1], x => x);
// a TS cast around the kept root COMBINED with a SE-bearing hop key: the wrapper peels away and the
// key migrates exactly like the unwrapped twin
let e = 0;
let w;
export const castAndSeKey = null == (w = _globalThis.window) ? void 0 : _flatMapMaybeArray(w[e++, "Array"].prototype).call([1], x => [x]);
export { e };

// A TS cast around the kept root COMBINED with the double-optional chain: the wrappers peel on the
// way down, the memo still anchors at the root guard and both dead hops drop.
let dw;
export const castDoubleOptional = null == (dw = _globalThis.window) ? void 0 : _findIndexMaybeArray(dw[e++, "Array"].prototype).call([1], v => v === 1);