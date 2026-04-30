import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// multi-declarator: first is a flattened `globalThis` proxy destructure; sibling is an
// IIFE whose body contains a class StaticBlock declaring `var globalThis`. inside the
// StaticBlock the local `var` shadows the global, so its reference must NOT be rewritten
// to the polyfill binding
const K = (() => {
  let acc = '';
  class Inner {
    static {
      var globalThis = 'static';
      var self = 'static-self';
      acc = globalThis + self;
    }
  }
  Inner;
  return acc;
})();
export { from, K };