import _globalThis from "@core-js/pure/actual/global-this";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _WeakSet from "@core-js/pure/actual/weak-set";
// pure counts a global present when its constructor entry exists at the selected mode, even when the
// user's filter excludes it (`WeakMap`, kept raw). These fallbacks disappear, as for an imported `WeakSet`.
// The separate AsyncIterator constructor entry is unavailable below full, so its fallback keeps Math.sumPrecise.
// A constructor supplied only by namespace dependencies does not make its separate pure entry available.
export const excluded = _globalThis.WeakMap;
export const injected = _WeakSet;
export const uncarried = _globalThis.AsyncIterator || _Math$sumPrecise(list);