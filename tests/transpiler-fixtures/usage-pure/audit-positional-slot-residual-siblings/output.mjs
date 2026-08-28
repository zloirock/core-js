import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the POSITIONAL slot renames an ARRAY element to a minted name, and what the pattern binds BESIDE
// the claim rides the residual: the element pattern survives against that name with the claim's own
// slot spelled as a sentinel, so a named sibling binds what it bound and a rest goes on gathering.
// the receiver here is a BINDING, not a literal - the pairing routes have no element to walk to, so
// this is the only shape that reaches the claim at all
const rows = _Object$assign([1, [2]], {
  extra: 7
});
const holder = {
  y: rows,
  keep: 3
};
const pair = [holder];
const [_ref] = pair;
const _ref2 = _ref.y;
const at = _at(_ref2);
const {
  at: _unused,
  ...rest
} = _ref2;
const [_ref3] = pair;
// ... and a sibling one level OUT reads the value ITS level reads, in the place the source's own
// nesting puts it: what stands before the hop is read before it, what stands after it after the
// inner level
const _ref4 = _ref3.y;
const flat = _flatMaybeArray(_ref4);
const {
  flat: _unused2,
  extra
} = _ref4;
const [_ref5] = pair;
const _ref6 = _ref5.y;
const concat = _concatMaybeArray(_ref6);
const {
  concat: _unused3
} = _ref6;
const {
  keep
} = _ref5;
const [_ref7] = pair;
// two named siblings beside the claim, one of them a NUMERIC key - the residual re-emits both
const {
  keep: leadKeep
} = _ref7;
const _ref8 = _ref7.y;
const findLastIndex = _findLastIndexMaybeArray(_ref8);
const {
  findLastIndex: _unused4
} = _ref8;
const [_ref9] = pair;
// NEGATIVE: a COMPUTED claim key is spelled by its own channel, so the residual cannot re-emit it -
// the shape keeps its own destructure
const _ref10 = _ref9.y;
const findLast = _findLastMaybeArray(_ref10);
const {
  findLast: _unused5,
  extra: extra2,
  0: first
} = _ref10;
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