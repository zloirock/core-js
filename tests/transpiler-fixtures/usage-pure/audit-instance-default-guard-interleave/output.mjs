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
var _ref3, _ref5, _ref8, _ref10, _ref12, _ref15, _ref17, _ref20, _ref24, _ref28, _ref30, _ref31;
// PATTERN axis of the per-prop interleave: segments and guards alternate exactly like the
// native per-prop evaluation (key, read, default, next key)

// both props defaulted: two guards, two segments
const _ref = recvA,
  _ref2 = _ref,
  a = null == _ref2 ? _ref2[""] : (e1(), (_ref3 = _at(_ref2)) === void 0 ? dfltA() : _ref3),
  _ref4 = _ref,
  f = null == _ref4 ? _ref4[""] : (e2(), (_ref5 = _flatMaybeArray(_ref4)) === void 0 ? dfltB() : _ref5);

// Three defaulted properties preserve key, extraction and default order from left to right.
const _ref6 = recvB,
  _ref7 = _ref6,
  i = null == _ref7 ? _ref7[""] : (e3(), (_ref8 = _includes(_ref7)) === void 0 ? dfltC() : _ref8),
  _ref9 = _ref6,
  fl = null == _ref9 ? _ref9[""] : (e4(), (_ref10 = _findLastMaybeArray(_ref9)) === void 0 ? dfltD() : _ref10),
  _ref11 = _ref6,
  fli = null == _ref11 ? _ref11[""] : (e5(), (_ref12 = _findLastIndexMaybeArray(_ref11)) === void 0 ? dfltE() : _ref12);

// a later default may read the PRIOR extracted binding (bound before its key evaluates)
const _ref13 = recvC,
  _ref14 = _ref13,
  ts = null == _ref14 ? _ref14[""] : (e6(), (_ref15 = _toSortedMaybeArray(_ref14)) === void 0 ? dfltF() : _ref15),
  _ref16 = _ref13,
  tr = null == _ref16 ? _ref16[""] : (e7(), (_ref17 = _toReversedMaybeArray(_ref16)) === void 0 ? ts : _ref17);

// two declarators of one declaration, each with its own split
const _ref18 = recvD,
  _ref19 = _ref18,
  fm = null == _ref19 ? _ref19[""] : (e8(), (_ref20 = _flatMapMaybeArray(_ref19)) === void 0 ? dfltG() : _ref20),
  _ref21 = _ref18,
  en = null == _ref21 ? _ref21[""] : (e9(), _entries(_ref21)),
  _ref22 = recvE,
  _ref23 = _ref22,
  w10 = null == _ref23 ? _ref23[""] : (e10(), (_ref24 = _withMaybeArray(_ref23)) === void 0 ? dfltH() : _ref24),
  _ref25 = _ref22,
  ks = null == _ref25 ? _ref25[""] : (e11(), _keys(_ref25));

// shared memoized receiver with two guards: one `_ref`, guards read it in order (typed -
// both defaults dead at runtime, the shape still locks ref sharing and numbering)
const _ref26 = [7, 8],
  _ref27 = _ref26,
  fi = null == _ref27 ? _ref27[""] : (e12(), (_ref28 = _fillMaybeArray(_ref27)) === void 0 ? dfltI() : _ref28),
  _ref29 = _ref26,
  fnd = null == _ref29 ? _ref29[""] : (e13(), (_ref30 = _findMaybeArray(_ref29)) === void 0 ? dfltJ() : _ref30);

// a nested assignment under a USER nav the extraction owns dispatches on the nav (`recvF.codes`,
// read once) and the consumed slot leaves with the host - the declaration host's answer
let m;
m = (_ref31 = _findIndexMaybeArray(recvF.codes)) === void 0 ? dfltK() : _ref31;
export { a, f, i, fl, fli, ts, tr, fm, en, w10, ks, fi, fnd, m };