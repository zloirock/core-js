// a class expression extending a known global (`Set`) has its super rewritten in place to the polyfill
// import (`_Set`), whose prototype already provides the inherited instance methods. so `this.values()` is
// NOT redundantly re-polyfilled: the super identifier resolves back to `Set` (the rewritten polyfill alias
// maps to the global it aliases), so `this` is a Set whose inherited `values` the polyfilled super already
// carries. previously babel did not recognize the injected super alias and over-emitted a generic instance
// `values` helper, diverging from unplugin; now both skip
const C = class extends Set {
  first() { return this.values().next().value; }
};
