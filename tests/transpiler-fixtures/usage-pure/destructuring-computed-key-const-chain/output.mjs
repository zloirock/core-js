import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const key = 'items';
const {
  [key]: val
} = {
  items: [1]
};
_atMaybeArray(val).call(val, 0);