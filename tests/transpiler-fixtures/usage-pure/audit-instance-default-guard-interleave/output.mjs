import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref11, _ref12;
// PATTERN axis of the per-prop interleave: segments and guards alternate exactly like the
// native per-prop evaluation (key, read, default, next key)

// both props defaulted: two guards, two segments
const {
    [(e1(), 'at')]: _unused
  } = recvA,
  a = (_ref = _at(recvA)) === void 0 ? dfltA() : _ref,
  {
    [(e2(), 'flat')]: _unused2
  } = recvA,
  f = (_ref2 = _flatMaybeArray(recvA)) === void 0 ? dfltB() : _ref2;

// three defaulted props: nested cuts compose innermost-first
const {
    [(e3(), 'includes')]: _unused3
  } = recvB,
  i = (_ref3 = _includes(recvB)) === void 0 ? dfltC() : _ref3,
  {
    [(e4(), 'findLast')]: _unused4
  } = recvB,
  fl = (_ref4 = _findLastMaybeArray(recvB)) === void 0 ? dfltD() : _ref4,
  {
    [(e5(), 'findLastIndex')]: _unused5
  } = recvB,
  fli = (_ref5 = _findLastIndexMaybeArray(recvB)) === void 0 ? dfltE() : _ref5;

// a later default may read the PRIOR extracted binding (bound before its key evaluates)
const {
    [(e6(), 'toSorted')]: _unused6
  } = recvC,
  ts = (_ref6 = _toSortedMaybeArray(recvC)) === void 0 ? dfltF() : _ref6,
  {
    [(e7(), 'toReversed')]: _unused7
  } = recvC,
  tr = (_ref7 = _toReversedMaybeArray(recvC)) === void 0 ? ts : _ref7;

// two declarators of one declaration, each with its own split
const {
    [(e8(), 'flatMap')]: _unused8
  } = recvD,
  fm = (_ref8 = _flatMapMaybeArray(recvD)) === void 0 ? dfltG() : _ref8,
  {
    [(e9(), 'entries')]: _unused9
  } = recvD,
  en = _entries(recvD),
  {
    [(e10(), 'with')]: _unused10
  } = recvE,
  w10 = (_ref9 = _withMaybeArray(recvE)) === void 0 ? dfltH() : _ref9,
  {
    [(e11(), 'keys')]: _unused11
  } = recvE,
  ks = _keys(recvE);

// shared memoized receiver with two guards: one `_ref`, guards read it in order (typed -
// both defaults dead at runtime, the shape still locks ref sharing and numbering)
const _ref10 = [7, 8],
  {
    [(e12(), 'fill')]: _unused12
  } = _ref10,
  fi = (_ref11 = _fillMaybeArray(_ref10)) === void 0 ? dfltI() : _ref11,
  {
    [(e13(), 'find')]: _unused13
  } = _ref10,
  fnd = (_ref12 = _findMaybeArray(_ref10)) === void 0 ? dfltJ() : _ref12;

// nested assignment stays NATIVE (the receiver gate admits no member receivers) - negative
let m;
({
  codes: {
    findIndex: m = dfltK()
  }
} = recvF);
export { a, f, i, fl, fli, ts, tr, fm, en, w10, ks, fi, fnd, m };