// Nested instance extraction through a non-null realm still needs the realm's polyfill.
// Both captured methods must work without the native global and prototype methods.
const { w: { Array: { prototype: { at, flat } } } } = { w: globalThis! };
use(at, flat);
