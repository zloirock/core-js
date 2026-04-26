import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// source map mapping for a call whose argument spans multiple lines: each line of
// the arg must keep its source position.
function pull() {
  const list = _Array$from(new _Set([1, 2, 3, 4]), x => x * 2);
  return list;
}