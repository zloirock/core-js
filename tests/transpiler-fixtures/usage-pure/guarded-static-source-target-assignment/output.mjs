import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A split pattern can write into its own source binding before the next read.
// Every guard must read the original receiver rather than the overwritten name.
export function read(source) {
  var _ref;
  let M = source;
  if (!M) M = Array;
  let tail;
  M = (_ref = M, _ref === Array ? _Array$of : _ref.of), tail = _ref === Array ? _Array$from : _ref.from;
  return [M, tail];
}