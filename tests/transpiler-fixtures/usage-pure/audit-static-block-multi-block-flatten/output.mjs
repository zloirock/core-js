import _Array$from from "@core-js/pure/actual/array/from";
// two static-init blocks back-to-back. the second block declares `var globalThis` inside
// a NESTED BlockStatement (not directly under static). collectFunctionVars should still
// hoist that var into the StaticBlock's locals because BlockStatement is not a var-scope
// boundary, so the inner reference must resolve to the local var rather than the polyfill
const from = _Array$from;
const K = (() => {
  let acc = '';
  class Inner {
    static {
      Inner.first = 1;
    }
    static {
      {
        var globalThis = 'shadow';
        acc = globalThis.toString();
      }
    }
  }
  Inner;
  return acc;
})();
export { from, K };