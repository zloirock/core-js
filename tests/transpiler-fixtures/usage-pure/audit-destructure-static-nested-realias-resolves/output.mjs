import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// A constructor alias inside a literal wrapper retains its native static read.
// Following the alias still narrows the result's findLast and fill calls.
const Foo = Array;
const wrapper = {
  a: Foo
};
const {
  a: {
    from
  }
} = wrapper;
const arr = from('hi');
_findLastMaybeArray(arr).call(arr, x => x);
_fillMaybeArray(arr).call(arr, 0);