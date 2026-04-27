// instance destructure from a proxy-global chain with an unknown leaf:
// `const { at } = globalThis.myArr` keeps the chain text in output as the instance
// receiver (`_at(globalThis.myArr)`). without a manual root polyfill substitution,
// raw `globalThis` would ReferenceError on engines lacking it. emitPolyfilled detects
// proxy-global root via findProxyGlobal and inlines `_globalThis` in initTransformed
const { at } = globalThis.myArr;
at(0);
