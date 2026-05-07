import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// add instance method `[].values()` inside class body alongside computed-key polyfill.
// when both polyfills overlap with sibling-receiver Identifier rewrite, transform-queue
// reports overlapping edits
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