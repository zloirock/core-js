import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref4, _ref5, _ref6, _ref8;
// A single property keeps its key effect before the extraction and default.
const a = null == recvA ? recvA[""] : (e1(), (_ref = _at(recvA)) === void 0 ? dfltA() : _ref);

// The key, extraction and default all run before the following sibling declarator.
const f = null == recvB ? recvB[""] : (e2(), (_ref2 = _flatMaybeArray(recvB)) === void 0 ? dfltB() : _ref2),
  other = 1;

// A literal receiver is captured once before its key effect and extraction.
const _ref3 = [7, 8],
  i = null == _ref3 ? _ref3[""] : (e3(), (_ref4 = _includesMaybeArray(_ref3)) === void 0 ? dfltC() : _ref4);

// An array element with a live default is evaluated before the guarded extraction.
const [,] = [recvD];
const toReversed = (_ref5 = _toReversedMaybeArray(recvD)) === void 0 ? dfltD() : _ref5;

// Destructuring evaluates each key, read and default before the next property.
// The first default therefore runs before the second key effect.
const {} = recvE,
  fl = (e4(), (_ref6 = _findLastMaybeArray(recvE)) === void 0 ? dfltE() : _ref6),
  fli = null == recvE ? recvE[""] : (e5(), _findLastIndexMaybeArray(recvE));
const {
  [(e6(), 'toSorted')]: ts = dfltF(),
  ...restF
} = recvF;

// Multiple properties share one captured receiver and retain their native key, read
// and default order in the declaration.
const _ref7 = [9],
  w7 = null == _ref7 ? _ref7[""] : (e7(), (_ref8 = _withMaybeArray(_ref7)) === void 0 ? dfltG() : _ref8),
  t8 = null == _ref7 ? _ref7[""] : (e8(), _toSplicedMaybeArray(_ref7));
export { a, f, i, toReversed, other, fl, fli, ts, restF, w7, t8 };