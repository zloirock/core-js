import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
var _ref2, _ref4, _ref5;
// an array wrapper whose element cannot be spelled twice: a sole claim reads the element inline, and a
// residual beside the claim (a default, a sibling key) keeps the element slot, so a memo gives that
// residual and the dispatch the ONE read the source performs. the memo hoists only where no later
// declarator carries effects of its own; a rest keeps the pattern native, its claim included.
const arr = [3, [1, 2]];
const hb = {
  get y() {
    return [3, [1, 2]];
  }
};
let out;
const viaWrapOpaque = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const [_ref] = [_flatMapMaybeArray(arr).call(arr, x => x)];
const viaWrapOpaqueDefault = (_ref2 = _findLastMaybeArray(_ref)) === void 0 ? null : _ref2;
const viaWrapAheadOfPure = _includesMaybeArray(_concatMaybeArray(arr).call(arr));
const viaWrapPureTail = 1;
const [_ref3] = [hb.y],
  viaKeptResidual = _findLastIndexMaybeArray(_ref3),
  {
    length: viaKeptLength
  } = _ref3,
  viaKeptTail = 1;
const [{
  toSorted: viaSharedMemo,
  ...viaSharedRest
}] = [_sliceMaybeArray(_ref4 = hb.y).call(_ref4)];
// an assignment wrapper with a sequence prefix evaluates that prefix once, before its method read
let viaPeeledTail;
[_ref5] = [(out = 2, _toSplicedMaybeArray(arr).call(arr, 0, 0))];
viaPeeledTail = _toReversedMaybeArray(_ref5);
export { viaWrapOpaque, viaWrapOpaqueDefault, viaWrapAheadOfPure, viaWrapPureTail, out };
export { viaKeptResidual, viaKeptLength, viaKeptTail, viaSharedMemo, viaSharedRest, viaPeeledTail };