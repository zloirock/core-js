import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the param routes drop the user-written default (polyfill always wins), so a polyfillable read
// inside it goes with the text: body-extract removes the whole prop, the rest-sibling shape cuts
// it back to its key plus a fresh sentinel, and the inline default replaces the default alone.
// the last row keeps its default in the pattern, so the read there stays polyfilled in place
let e = 0;
export const bodyExtract = function f({
  [_Symbol$iterator]: it
} = Array) {
  let from = _Array$from;
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