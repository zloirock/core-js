import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Rewriting push clones its argument, including the container declarations inside it.
// The clone must retain its own slot writes, without borrowing a namesake's records.
export const values = [];
_pushMaybeArray(values).call(values, (() => {
  const holder = {
    item: {
      slot: Array
    }.slot
  };
  holder.item = {
    from() {
      return [9];
    }
  };
  return holder.item.from([1, 2]);
})());
export function untouched() {
  const holder = {
    item: Array
  };
  return _Array$from([3]);
}