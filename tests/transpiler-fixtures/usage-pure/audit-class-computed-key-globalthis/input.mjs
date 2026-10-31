// computed key in class method references `globalThis.Symbol.iterator`. computed-key
// position IS a reference (not a binding), so the inner `globalThis` should be polyfilled
// to `_globalThis` after the multi-decl flatten consumes the receiver. asserts the walker
// distinguishes computed-key (reference) from non-computed key (source-text name)
const { Array: { from } } = globalThis, kls = (() => {
  class C {
    [globalThis.Symbol.iterator]() { return [].values(); }
  }
  return new C();
})();
export { from, kls };
