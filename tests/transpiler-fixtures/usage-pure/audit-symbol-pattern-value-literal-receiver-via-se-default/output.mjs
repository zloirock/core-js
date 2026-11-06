import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref;
// An effect inside the inner default runs once, with its inner polyfill preserved.
let se = () => {};
const _ref2 = [8, 9],
  {
    next: seNext = (se(), _toReversedMaybeArray(_ref = [1]).call(_ref))
  } = _getIteratorMethod(_ref2),
  {
    third
  } = _ref2;
export const viaSeDefault = [seNext, third];