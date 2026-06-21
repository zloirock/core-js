// `globalThis` used as an object method KEY (not a reference) in a sibling. method-key
// positions must be skipped during the walk - rewriting to `_globalThis() {}` would be
// invalid syntax
const { Array: { from } } = globalThis, container = (() => {
  return {
    globalThis() { return 'method-named-globalThis'; }
  };
})();
export { from, container };
