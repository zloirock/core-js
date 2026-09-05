import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
var _ref2, _ref4, _ref6, _ref8, _ref10;
const _ref = [9];
// export x receiver-memo x LIVE instance default: the memo hoist plants BEFORE the `export`
// keyword, so the destructure keeps its export (every user binding stays on the module surface)
// and the internal ref temp does not join it. both memo flavours - a constant-literal receiver
// and a member receiver; the non-export twin locks the plain insert position (control)
export const {
    [(e(), 'with')]: _unused
  } = _ref,
  w = (_ref2 = _withMaybeArray(_ref)) === void 0 ? dflt() : _ref2,
  {
    [(e2(), 'toSpliced')]: _unused2
  } = _ref,
  t = _toSplicedMaybeArray(_ref);
const _ref3 = holder.p;
export const {
    [(e3(), 'flat')]: _unused3
  } = _ref3,
  m = (_ref4 = _flatMaybeArray(_ref3)) === void 0 ? dflt() : _ref4,
  {
    other
  } = _ref3;
const _ref5 = [7];
const {
    [(e4(), 'at')]: _unused4
  } = _ref5,
  a = (_ref6 = _atMaybeArray(_ref5)) === void 0 ? dflt() : _ref6;
console.log(w, t, m, other, a);
// TWO memoized constant-literal receivers in ONE exported multi-declarator: each declarator's
// memo takes its sibling-channel slot while every user binding stays exported
const _ref7 = [3];
export const {
    [(e5(), 'toReversed')]: _unused5
  } = _ref7,
  r1 = (_ref8 = _toReversedMaybeArray(_ref7)) === void 0 ? dflt() : _ref8,
  {
    other2
  } = _ref7;
const _ref9 = [4];
export const {
    [(e6(), 'toSorted')]: _unused6
  } = _ref9,
  s1 = (_ref10 = _toSortedMaybeArray(_ref9)) === void 0 ? dflt() : _ref10;
console.log(r1, s1, other2);