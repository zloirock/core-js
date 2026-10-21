import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
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