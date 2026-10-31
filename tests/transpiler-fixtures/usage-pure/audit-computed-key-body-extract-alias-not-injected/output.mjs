import _Array$from from "@core-js/pure/actual/array/from";
// An extracted function used as a key is not a proven property key.
// The exported parameter therefore stays native, including its named static.
const from = _Array$from;
export function pick({
  [from]: own,
  of
} = Array) {
  return [own, of([1]), from([2])];
}