import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A mirrored receiver supplies claimed statics; a rest-bearing parameter retains its native read.
// Declined rewrites preserve author defaults and their independent polyfill claims.
let e = 0;
export const bodyExtract = function f({
  from = [_Promise],
  [_Symbol$iterator]: it
} = {
  from: _Array$from,
  [_Symbol$iterator]: _getIteratorMethod(Array)
}) {
  return [from([1]), it];
}();
export const restSibling = (({
  from = [_Promise],
  ...rest
} = Array) => [from, rest])();
export const seKeyDefault = (({
  [(e++, 'from')]: from = [_Promise]
} = {
  "from": _Array$from
}) => from)();
export const keptDefault = (({
  at = [_Promise]
} = {
  at: _atMaybeArray([])
}) => at)();