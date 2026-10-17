import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Object$assign from "@core-js/pure/actual/object/assign";
var _ref9, _ref10;
// an array-wrapped claim one level down binds through a captured element: the residual re-emits the
// named siblings beside the claim - a numeric key included - in the place the source's nesting reads
// them, what stands before the hop before it and what stands after it after the inner level. a rest
// keeps its level native, a computed claim key keeps its own destructure, and an assignment host has
// no declaration for the residual to stand in.
const rows = _Object$assign([1, [2]], {
  extra: 7
});
const holder = {
  y: rows,
  keep: 3
};
const pair = [holder];
const [{
  y: {
    at,
    ...rest
  }
}] = pair;
const [_ref] = pair;
const _ref2 = _ref.y;
const flat = _flatMaybeArray(_ref2);
const {
  extra
} = _ref2;
const [_ref3] = pair;
const concat = _concatMaybeArray(_ref3.y);
const {
  keep
} = _ref3;
const [_ref4] = pair;
const {
  keep: leadKeep
} = _ref4;
const findLastIndex = _findLastIndexMaybeArray(_ref4.y);
const [_ref5] = pair;
const _ref6 = _ref5.y;
const findLast = _findLastMaybeArray(_ref6);
const {
  extra: extra2,
  0: first
} = _ref6;
const [_ref7] = pair,
  {
    y: _ref8
  } = _ref7,
  it = _getIteratorMethod(_ref8),
  {
    extra: extra3
  } = _ref8;
let viaAssign, keptAssign;
[_ref9] = pair, {
  y: _ref10
} = _ref9, viaAssign = _includesMaybeArray(_ref10), {
  keep: keptAssign
} = _ref10;
export { at, rest, flat, extra, concat, keep, leadKeep, findLastIndex, findLast, extra2, first, it, extra3, viaAssign, keptAssign };