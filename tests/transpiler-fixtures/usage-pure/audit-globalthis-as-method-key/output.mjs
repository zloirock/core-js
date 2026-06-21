import _Array$from from "@core-js/pure/actual/array/from";
// `globalThis` used as an object method KEY (not a reference) in a sibling. method-key
// positions must be skipped during the walk - rewriting to `_globalThis() {}` would be
// invalid syntax
const from = _Array$from;
const container = (() => {
  return {
    globalThis() {
      return 'method-named-globalThis';
    }
  };
})();
export { from, container };