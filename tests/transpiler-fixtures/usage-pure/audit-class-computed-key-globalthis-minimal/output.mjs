import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// minimal repro: computed-key in class method using globalThis as proxy chain. without
// `[].values()` or other instance dispatch, just to isolate whether the issue is the
// computed-key polyfill substitution colliding with sibling-receiver Identifier rewrite
const from = _Array$from;
const kls = (() => {
  class C {
    [_Symbol$iterator]() {
      return null;
    }
  }
  return C;
})();
export { from, kls };