import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Set from "@core-js/pure/actual/set/constructor";
// An unproven computed key keeps the selecting parameter default native.
// The key itself still receives its global polyfill.
const cond = true;
function pick({
  [_Set]: ctor
} = cond ? Array : _Iterator) {
  let from = _Array$from;
  return [from, ctor];
}
pick();