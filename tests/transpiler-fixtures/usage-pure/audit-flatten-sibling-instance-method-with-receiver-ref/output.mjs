import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
// Flatten on the first declarator with a sibling arrow holding both a `globalThis` receiver-ref
// and an instance-method call `.values()`. The arrow body is rewritten (adding `var _ref;` for
// receiver memoize) against the original source, while the `globalThis -> _globalThis` substitution
// targets text inside that same slice. If the substitution mutates what the body-wrap matches
// against, the wrap is dropped and a stray `)` from the original `.values()` leaks into the emit.
const from = _Array$from;
const val = () => {
  var _ref;
  return _valuesMaybeArray(_ref = [_globalThis]).call(_ref);
};
console.log(from, val());