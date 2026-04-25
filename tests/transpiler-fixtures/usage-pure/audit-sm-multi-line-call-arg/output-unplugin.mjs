import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
function pull() {
  const list = _Array$from(
    new _Set([1, 2, 3, 4]),
    x => x * 2,
  );
  return list;
}