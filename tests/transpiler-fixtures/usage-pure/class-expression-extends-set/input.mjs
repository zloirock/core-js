// a class expression extending a known global (`Set`) has its super rewritten in place to the polyfill
// import (`_Set`), whose prototype already provides the inherited instance methods. so `this.values()` is
// NOT redundantly re-polyfilled - resolveSuperGlobalName maps the rewritten `_Set` alias back to `Set` via
// its polyfillHint, so `this` resolves to Set and the `_Set` super's `values` is recognized as already
// present. previously babel did not recognize the injected `_Set` super and over-emitted a generic `_values`,
// diverging from unplugin; now both skip
const C = class extends Set {
  first() { return this.values().next().value; }
};
