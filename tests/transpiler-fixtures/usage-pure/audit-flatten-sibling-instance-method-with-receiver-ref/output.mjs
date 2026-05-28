import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
// Flatten on the first declarator with a sibling arrow that contains both a `globalThis`
// receiver-ref and an instance-method call `.values()`. The arrow body is rewritten into
// `{ var _ref; return _valuesMaybeArray(_ref = [...]).call(_ref); }` matched against the
// original source, while the `globalThis -> _globalThis` substitution targets text inside
// that same wrapped slice. If the substitution mutates the input the body wrap matches
// against, the wrap composition is dropped and a stray `)` from the original `.values()`
// call leaks into the emit, producing invalid syntax at runtime.
const from = _Array$from;
const val = () => {
  var _ref;
  return _valuesMaybeArray(_ref = [_globalThis]).call(_ref);
};
console.log(from, val());