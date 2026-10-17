import _Array$from from "@core-js/pure/actual/array/from";
// An enum-spelled write leaves the neighboring static substitutable.
enum WriteKeys {
  OF = 'of',
}
Array[WriteKeys.OF] = function () {
  return [9];
};
export const r14 = _Array$from([2]);