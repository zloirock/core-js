import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// `globalThis` used as an object property/method KEY (not reference) in sibling. asserts
// `isNonReferencePosition` correctly skips method-key positions during walker iteration -
// rewriting to `_globalThis() {}` would be invalid syntax
const container = (() => {
  return {
    globalThis() {
      return 'method-named-globalThis';
    }
  };
})();
export { from, container };