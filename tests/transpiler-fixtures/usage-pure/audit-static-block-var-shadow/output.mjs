import _Array$from from "@core-js/pure/actual/array/from";
// static block has its own variable scope - `var globalThis` inside a static block
// shadows the outer global there but not in surrounding scope. asserts walker doesn't
// pull static-block vars into the outer function scope (collectFunctionVars stops at
// StaticBlock boundary), and pushBlockScope handles StaticBlock's own body
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