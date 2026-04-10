import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const key1 = 'items';
const key2 = key1;
const {
  [key2]: arr
} = {
  items: [1, 2, 3]
};
_atMaybeArray(arr).call(arr, 0);