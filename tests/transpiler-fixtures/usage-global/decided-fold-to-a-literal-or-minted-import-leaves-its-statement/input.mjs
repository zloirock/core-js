// usage-global rewrites none of these statements: each loads the modules of the global its test or its
// served left reads, folded away in pure or not
typeof Map == 'undefined' ? installMap() : fallbackMap;
globalThis.Set || (globalThis.Set = SetShim);
typeof Symbol == 'undefined' ? installSymbol() : 0;
typeof Reflect == 'undefined' ? installReflect() : void 0;
if (ready) globalThis.WeakSet || (globalThis.WeakSet = WeakSetShim);
export const settled = Promise.allSettled([]);
