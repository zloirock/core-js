import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _globalThis from "@core-js/pure/actual/global-this";
// a TS cast around the kept root COMBINED with a SE-bearing hop key: the wrapper peels away and the
// key migrates exactly like the unwrapped twin
let e = 0;
export { e };
// A TS cast around the kept root COMBINED with the double-optional chain: the wrappers peel on the
// way down, the memo still anchors at the root guard and both dead hops drop.
let dw;
export const castDoubleOptional = null == (dw = _globalThis.window) ? void 0 : _findIndexMaybeArray(dw[e++, "Array"].prototype).call([1], v => v === 1);