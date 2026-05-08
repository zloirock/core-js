import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `const Foo = Array; const wrapper = { a: Foo }` chains identifier hops before reaching the constructor.
// Static descent must follow each const hop until it lands on a literal object or unbound identifier.
const Foo = Array;
const wrapper = {
  a: Foo
};
const from = _Array$from;
const arr = from(['x']);
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'x');