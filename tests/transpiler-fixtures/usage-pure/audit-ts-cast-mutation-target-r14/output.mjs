import _Array$from from "@core-js/pure/actual/array/from";
// An enum-spelled write leaves the neighboring static substitutable.
enum WriteKeys {
  OF = 'of'
}
// @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
Array[WriteKeys.OF] = function () {
  return [9];
};
export const r14 = _Array$from([2]);