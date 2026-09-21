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
var _ref2, _ref4, _ref6, _ref8, _ref10, _ref12, _ref14, _ref16, _ref19, _ref22, _ref24, _ref25;
// PATTERN axis of the per-prop interleave: segments and guards alternate exactly like the
// native per-prop evaluation (key, read, default, next key)

// both props defaulted: two guards, two segments
const _ref = recvA,
  a = null == _ref ? _ref[""] : (e1(), (_ref2 = _at(_ref)) === void 0 ? dfltA() : _ref2),
  _ref3 = _ref,
  f = null == _ref3 ? _ref3[""] : (e2(), (_ref4 = _flatMaybeArray(_ref3)) === void 0 ? dfltB() : _ref4);

// Three defaulted properties preserve key, extraction and default order from left to right.
const _ref5 = recvB,
  i = null == _ref5 ? _ref5[""] : (e3(), (_ref6 = _includes(_ref5)) === void 0 ? dfltC() : _ref6),
  _ref7 = _ref5,
  fl = null == _ref7 ? _ref7[""] : (e4(), (_ref8 = _findLastMaybeArray(_ref7)) === void 0 ? dfltD() : _ref8),
  _ref9 = _ref5,
  fli = null == _ref9 ? _ref9[""] : (e5(), (_ref10 = _findLastIndexMaybeArray(_ref9)) === void 0 ? dfltE() : _ref10);

// a later default may read the PRIOR extracted binding (bound before its key evaluates)
const _ref11 = recvC,
  ts = null == _ref11 ? _ref11[""] : (e6(), (_ref12 = _toSortedMaybeArray(_ref11)) === void 0 ? dfltF() : _ref12),
  _ref13 = _ref11,
  tr = null == _ref13 ? _ref13[""] : (e7(), (_ref14 = _toReversedMaybeArray(_ref13)) === void 0 ? ts : _ref14);

// two declarators of one declaration, each with its own split
const _ref15 = recvD,
  fm = null == _ref15 ? _ref15[""] : (e8(), (_ref16 = _flatMapMaybeArray(_ref15)) === void 0 ? dfltG() : _ref16),
  _ref17 = _ref15,
  en = null == _ref17 ? _ref17[""] : (e9(), _entries(_ref17)),
  _ref18 = recvE,
  w10 = null == _ref18 ? _ref18[""] : (e10(), (_ref19 = _withMaybeArray(_ref18)) === void 0 ? dfltH() : _ref19),
  _ref20 = _ref18,
  ks = null == _ref20 ? _ref20[""] : (e11(), _keys(_ref20));

// shared memoized receiver with two guards: one `_ref`, guards read it in order (typed -
// both defaults dead at runtime, the shape still locks ref sharing and numbering)
const _ref21 = [7, 8],
  fi = null == _ref21 ? _ref21[""] : (e12(), (_ref22 = _fillMaybeArray(_ref21)) === void 0 ? dfltI() : _ref22),
  _ref23 = _ref21,
  fnd = null == _ref23 ? _ref23[""] : (e13(), (_ref24 = _findMaybeArray(_ref23)) === void 0 ? dfltJ() : _ref24);

// a nested assignment under a USER nav the extraction owns dispatches on the nav (`recvF.codes`,
// read once) and the consumed slot leaves with the host - the declaration host's answer
let m;
m = (_ref25 = _findIndexMaybeArray(recvF.codes)) === void 0 ? dfltK() : _ref25;
export { a, f, i, fl, fli, ts, tr, fm, en, w10, ks, fi, fnd, m };