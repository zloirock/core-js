import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Extracted defaults keep the earlier statement and the later array binding.
export const log = [];
export const value = function read({
  from: _unused,
  ...rest
} = Array, list = [1]) {
  let from = _Array$from;
  _pushMaybeArray(log).call(log, 1);
  const includes = _includesMaybeArray(list);
  return [typeof from, typeof includes, typeof rest];
}();