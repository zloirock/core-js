import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// Symbol.iterator computed key wrapped in parens. oxc preserves ParenthesizedExpression
// for `[(Symbol.iterator)]`; babel strips. Both pipelines should resolve via Symbol.X
// detection through unwrapParens / peelFallbackWrappers and emit a polyfill
const obj = {
  [_Symbol$iterator]() {
    var _ref;
    return _valuesMaybeArray(_ref = [1, 2, 3]).call(_ref);
  }
};
const arr = [...obj];