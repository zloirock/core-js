import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the first row takes the caller-correct DEFAULT synth (the wks sibling joins it), so its
// user-written leaf default survives in the pattern - dead when the synth default fires,
// exactly as native leaves it. the remaining param routes still drop the user-written
// default (polyfill always wins): the rest-sibling shape cuts the prop back to its key plus
// a fresh sentinel, and the inline default replaces the default alone. the last row keeps
// its default in the pattern, so the read there stays polyfilled in place
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
  from = _Array$from,
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