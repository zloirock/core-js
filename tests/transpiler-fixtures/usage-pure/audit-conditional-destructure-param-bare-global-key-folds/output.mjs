import _Iterator from "@core-js/pure/actual/iterator";
import _Set from "@core-js/pure/actual/set/constructor";
// An unproven computed key keeps the selecting parameter default native.
// The key itself still receives its global polyfill.
const cond = true;
function pick({
  from,
  [_Set]: ctor
} = cond ? Array : _Iterator) {
  return [from, ctor];
}
pick();