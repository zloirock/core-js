import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
declare const obj: {
  items: number[];
};
const {
  items
} = obj;
_atMaybeArray(items).call(items, -1);