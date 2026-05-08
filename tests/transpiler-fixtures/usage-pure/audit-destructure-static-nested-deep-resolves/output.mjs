import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// 2-level nested destructure `const { a: { b: { from } } } = wrapper` walks two outer
// keys (`['a', 'b']`) through the const-bound ObjectExpression chain. Receiver chain:
// wrapper -> { a: { b: Array } } -> step 'a' -> { b: Array } -> step 'b' -> Identifier
// 'Array'. Walker recurses into nested ObjectExpression at each step. Distinct methods
// (at, includes, copyWithin) lock array narrowing per call site
const wrapper = {
  a: {
    b: Array
  }
};
const from = _Array$from;
const arr = from('xy');
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'x');
_copyWithinMaybeArray(arr).call(arr, 0, 1);