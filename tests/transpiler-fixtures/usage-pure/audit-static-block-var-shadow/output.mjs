import _Array$from from "@core-js/pure/actual/array/from";
// static block has its own variable scope - `var globalThis` inside a static block
// shadows the outer global there but not in surrounding scope. asserts the walker doesn't
// pull static-block vars into the outer function scope (the function-locals walk stops at
// the StaticBlock boundary), and the StaticBlock's own body gets its own scope
const from = _Array$from;
const K = (() => {
  class Inner {
    static {
      var globalThis = 'static-shadow';
      Inner.tag = globalThis;
    }
  }
  return Inner.tag;
})();
export { from, K };