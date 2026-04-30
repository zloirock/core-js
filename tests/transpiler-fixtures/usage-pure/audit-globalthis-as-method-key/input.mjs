// `globalThis` used as an object property/method KEY (not reference) in sibling. asserts
// `isNonReferencePosition` correctly skips method-key positions during walker iteration -
// rewriting to `_globalThis() {}` would be invalid syntax
const { Array: { from } } = globalThis, container = (() => {
  return {
    globalThis() { return 'method-named-globalThis'; }
  };
})();
export { from, container };
