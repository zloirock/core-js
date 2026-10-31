import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
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
const arr = from(['x']);
_atMaybeArray(arr).call(arr, 0);
_includesMaybeArray(arr).call(arr, 'x');