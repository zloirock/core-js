// no shadowing binding for `globalThis` here, so it IS the global object: usage-pure substitutes the
// unshadowed proxy-global receiver with a pure global-this import (`globalThis.Array` -> `_globalThis.Array`).
// `slice` is destructured off the Array CONSTRUCTOR - a static-position read with no matching static, so
// nothing is polyfilled. (contrast: a `globalThis` parameter would shadow it and the receiver stays verbatim)
const { slice } = globalThis.Array;
use(slice);
