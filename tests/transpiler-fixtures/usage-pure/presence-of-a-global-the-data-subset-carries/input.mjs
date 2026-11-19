// pure counts a global present when its constructor entry exists at the selected mode, even when the
// user's filter excludes it (`WeakMap`, kept raw). These fallbacks disappear, as for an imported `WeakSet`.
// The separate AsyncIterator constructor entry is unavailable below full, so its fallback keeps Math.sumPrecise.
// A constructor supplied only by namespace dependencies does not make its separate pure entry available.
export const excluded = globalThis.WeakMap || Object.fromEntries(pairs);
export const injected = globalThis.WeakSet || Array.of(item);
export const uncarried = globalThis.AsyncIterator || Math.sumPrecise(list);
