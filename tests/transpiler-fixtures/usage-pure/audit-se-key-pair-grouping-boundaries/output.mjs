import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Multiple computed-key extractions retain their declaration order and TDZs.
// Each stable source is checked before its key effect; a plain following initializer stays last.
const a = null == arr ? arr[""] : (e1(), _at(arr)),
  f = null == arr2 ? arr2[""] : (e2(), _flatMaybeArray(arr2));
const i = null == arr3 ? arr3[""] : (e3(), _includes(arr3)),
  plain = 5;
console.log(a, f, i, plain);