import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
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
// ... and a sibling one level OUT reads the value ITS level reads, in the place the source's own
// nesting puts it: what stands before the hop is read before it, what stands after it after the
// inner level
const _ref2 = _ref.y;
const flat = _flatMaybeArray(_ref2);
const {
  extra
} = _ref2;
const [_ref3] = pair;
const _ref4 = _ref3.y;
const concat = _concatMaybeArray(_ref4);
const {
  keep
} = _ref3;
const [_ref5] = pair;
// two named siblings beside the claim, one of them a NUMERIC key - the residual re-emits both
const {
  keep: leadKeep
} = _ref5;
const _ref6 = _ref5.y;
const findLastIndex = _findLastIndexMaybeArray(_ref6);
const [_ref7] = pair;
// NEGATIVE: a COMPUTED claim key is spelled by its own channel, so the residual cannot re-emit it -
// the shape keeps its own destructure
const _ref8 = _ref7.y;
const findLast = _findLastMaybeArray(_ref8);
const {
  extra: extra2,
  0: first
} = _ref8;
const [{
  y: {
    [_Symbol$iterator]: it,
    extra: extra3
  }
}] = pair;
// NEGATIVE: an ASSIGNMENT host binds no declaration, so the residual has nowhere to stand
let viaAssign, keptAssign;
[{
  y: {
    at: viaAssign,
    keep: keptAssign
  }
}] = pair;
export { at, rest, flat, extra, concat, keep, leadKeep, findLastIndex, findLast, extra2, first, it, extra3, viaAssign, keptAssign };