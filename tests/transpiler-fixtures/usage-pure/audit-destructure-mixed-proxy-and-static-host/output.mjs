import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Direct realm destructuring serves Array.from while a literal Object wrapper stays native.
// Both static results still narrow their later instance calls independently.
const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
const wrapper = {
  a: Object
};
const {
  a: {
    entries
  }
} = wrapper;
const arr = from('hi');
const pairs = entries({
  k: 1
});
_includesMaybeArray(arr).call(arr, 'h');
_atMaybeArray(pairs).call(pairs, 0);