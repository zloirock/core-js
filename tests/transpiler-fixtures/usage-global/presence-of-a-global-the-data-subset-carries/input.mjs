// usage-global counts a global present when its constructor entry exists at the selected mode, even when
// the user's filter excludes it (`WeakMap`). These fallbacks load nothing, as for an injected `WeakSet`.
// The separate AsyncIterator constructor entry is unavailable below full, so its fallback keeps Math.sumPrecise.
// Loading its namespace family can still bring the constructor as a dependency; it does not decide this fallback.
export const excluded = globalThis.WeakMap || Object.fromEntries(pairs);
export const injected = globalThis.WeakSet || Array.of(item);
export const uncarried = globalThis.AsyncIterator || Math.sumPrecise(list);
