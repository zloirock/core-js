import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
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
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref12, _ref14, _ref15, _ref16;
// PATTERN axis of the per-prop interleave: segments and guards alternate exactly like the
// native per-prop evaluation (key, read, default, next key)

// both props defaulted: two guards, two segments
const {} = recvA,
  a = (e1(), (_ref = _at(recvA)) === void 0 ? dfltA() : _ref),
  f = null == recvA ? recvA[""] : (e2(), (_ref2 = _flatMaybeArray(recvA)) === void 0 ? dfltB() : _ref2);

// Three defaulted properties preserve key, extraction and default order from left to right.
const {} = recvB,
  i = (e3(), (_ref3 = _includes(recvB)) === void 0 ? dfltC() : _ref3),
  fl = null == recvB ? recvB[""] : (e4(), (_ref4 = _findLastMaybeArray(recvB)) === void 0 ? dfltD() : _ref4),
  fli = null == recvB ? recvB[""] : (e5(), (_ref5 = _findLastIndexMaybeArray(recvB)) === void 0 ? dfltE() : _ref5);

// a later default may read the PRIOR extracted binding (bound before its key evaluates)
const {} = recvC,
  ts = (e6(), (_ref6 = _toSortedMaybeArray(recvC)) === void 0 ? dfltF() : _ref6),
  tr = null == recvC ? recvC[""] : (e7(), (_ref7 = _toReversedMaybeArray(recvC)) === void 0 ? ts : _ref7);

// two declarators of one declaration, each with its own split
const {} = recvD,
  fm = (e8(), (_ref8 = _flatMapMaybeArray(recvD)) === void 0 ? dfltG() : _ref8),
  en = null == recvD ? recvD[""] : (e9(), _entries(recvD)),
  {} = recvE,
  w10 = (e10(), (_ref9 = _withMaybeArray(recvE)) === void 0 ? dfltH() : _ref9),
  ks = null == recvE ? recvE[""] : (e11(), _keys(recvE));

// shared memoized receiver: one `_ref`, both reads take it in order (typed - both defaults dead
// at runtime, the shape still locks ref sharing and numbering); a literal is never nullish, so
// neither read takes a null guard
const _ref11 = [7, 8],
  fi = (e12(), (_ref10 = _fillMaybeArray(_ref11)) === void 0 ? dfltI() : _ref10),
  fnd = (e13(), (_ref12 = _findMaybeArray(_ref11)) === void 0 ? dfltJ() : _ref12);

// ... while a call result may be nullish: its memo takes a null guard ahead of each key
const _ref13 = getRows(),
  fi2 = null == _ref13 ? _ref13[""] : (e14(), (_ref14 = _fillMaybeArray(_ref13)) === void 0 ? dfltL() : _ref14),
  fnd2 = null == _ref13 ? _ref13[""] : (e15(), (_ref15 = _findMaybeArray(_ref13)) === void 0 ? dfltM() : _ref15);

// a nested assignment under a USER nav the extraction owns dispatches on the nav (`recvF.codes`,
// read once) and the consumed slot leaves with the host - the declaration host's answer
let m;
m = (_ref16 = _findIndexMaybeArray(recvF.codes)) === void 0 ? dfltK() : _ref16;
export { a, f, i, fl, fli, ts, tr, fm, en, w10, ks, fi, fnd, fi2, fnd2, m };