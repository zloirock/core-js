import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// computed key in class method references `globalThis.Symbol.iterator`. computed-key
// position IS a reference (not a binding), so the inner `globalThis` should be polyfilled
// to `_globalThis` after the multi-decl flatten consumes the receiver. asserts the walker
// distinguishes computed-key (reference) from non-computed key (source-text name)
const from = _Array$from;
const kls = (() => {
  class C {
    [_Symbol$iterator]() {
      var _ref;
      return _valuesMaybeArray(_ref = []).call(_ref);
    }
  }
  return new C();
})();
export { from, kls };