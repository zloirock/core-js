import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4;
// runtime-transparent WRAPPERS between a kept proxy root and its navigation. they carry no runtime meaning,
// so each shape must come out exactly like its bare twin: the assignment stays as the root, the redundant
// proxy hop drops, the guard survives. the climb that finds the collapse target has to peel to the same
// depth its anchor sits at - a chain-assign anchor IS an assignment, so a descent that peels through
// assignments walks past it and the climb dies on the first wrapper, leaving the hop raw.
// a cast around the root, a non-null assertion, plain parens, and a wrapper mid-chain. distinct methods.
let a;
export const throughCast = null == (_ref = (a = _globalThis.window) as any) ? void 0 : _flatMaybeArray(_ref.Array.prototype).call([1, [2]]);

let b;
export const throughNonNull = null == (_ref2 = (b = _globalThis.window)!) ? void 0 : _atMaybeArray(_ref2.Array.prototype).call([1], 0);

let c;
export const throughParens = null == (_ref3 = (c = _globalThis.window)) ? void 0 : _includesMaybeArray(_ref3.Array.prototype).call([1], 1);

let d;
export const wrapperMidChain = _findLastMaybeArray(((d = _globalThis.window)?.Array).prototype).call([1], x => x);
// a TS cast around the kept root COMBINED with a SE-bearing hop key: the wrapper peels away and the
// key migrates exactly like the unwrapped twin
let e = 0;
let w;
export const castAndSeKey = null == (_ref4 = (w = _globalThis.window) as any) ? void 0 : _flatMapMaybeArray(_ref4[e++, "Array"].prototype).call([1], x => [x]);
export { e };