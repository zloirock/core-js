import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _globalThis from "@core-js/pure/actual/global-this";
// a TS cast around the kept root COMBINED with a SE-bearing hop key: the wrapper peels away and the
// key migrates exactly like the unwrapped twin
let e = 0;
let w;
export const castAndSeKey = null == (w = _globalThis.window) ? void 0 : _flatMapMaybeArray(w[e++, "Array"].prototype).call([1], x => [x]);
export { e };