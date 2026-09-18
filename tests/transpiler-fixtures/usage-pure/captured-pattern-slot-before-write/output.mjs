import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A captured static value survives later writes to its container, including when push clones
// the whole capture. The read must keep its Array.from polyfill in a stripped realm.
export const values = [];
_pushMaybeArray(values).call(values, (() => {
  const box = {
    item: Array
  };
  const alias = box;
  const {
    item
  } = alias;
  box.item = {};
  return _Array$from([1, 2]);
})());