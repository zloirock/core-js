import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A constructor alias inside a literal wrapper keeps its native static read.
// Following that alias still narrows the result's array instance calls.
const Foo = Array;
const wrapper = {
  a: Foo
};
const {
  a: {
    from
  }
} = wrapper;
const arr = from(['x']);
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'x');