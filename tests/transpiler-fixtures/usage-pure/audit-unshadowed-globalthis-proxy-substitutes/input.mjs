// no shadowing binding for `globalThis` here, so it IS the global object: usage-pure rewrites the
// proxy-global receiver to a pure global-this import and polyfills the destructured `slice` instance
// method. (contrast: a `globalThis` parameter would shadow it and the receiver would stay verbatim)
const { slice } = globalThis.Array;
use(slice);
