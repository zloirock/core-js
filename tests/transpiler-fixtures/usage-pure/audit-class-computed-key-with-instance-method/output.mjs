import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Instance-method `[].values()` lives inside a class body whose computed key is itself a
// polyfilled `globalThis.Symbol.iterator` access. Both rewrites cover overlapping source
// ranges with the sibling receiver substitution; if their edits are not composed, the
// bundler aborts on overlapping edits and the class fails to emit.
const from = _Array$from;
const kls = (() => {
  class C {
    [_Symbol$iterator]() {
      var _ref;
      return _valuesMaybeArray(_ref = []).call(_ref);
    }
  }
  return C;
})();
export { from, kls };