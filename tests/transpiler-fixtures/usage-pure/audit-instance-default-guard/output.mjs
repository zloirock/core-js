import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _at from "@core-js/pure/actual/instance/at";
var _ref2, _ref4, _ref6, _ref7, _ref9, _ref12;
// A single property keeps its key effect before the extraction and default.
const _ref = recvA,
  a = null == _ref ? _ref[""] : (e1(), (_ref2 = _at(_ref)) === void 0 ? dfltA() : _ref2);

// The key, extraction and default all run before the following sibling declarator.
const _ref3 = recvB,
  f = null == _ref3 ? _ref3[""] : (e2(), (_ref4 = _flatMaybeArray(_ref3)) === void 0 ? dfltB() : _ref4),
  other = 1;

// A literal receiver is captured once before its key effect and extraction.
const _ref5 = [7, 8],
  i = null == _ref5 ? _ref5[""] : (e3(), (_ref6 = _includesMaybeArray(_ref5)) === void 0 ? dfltC() : _ref6);

// eliminate arm (array-wrapped sole binding, pure key): no residual survives, the guard
// wraps the extraction in place
const toReversed = (_ref7 = _toReversedMaybeArray(recvD)) === void 0 ? dfltD() : _ref7; // Destructuring evaluates each key, read and default before the next property.
// The first default therefore runs before the second key effect.
const _ref8 = recvE,
  fl = null == _ref8 ? _ref8[""] : (e4(), (_ref9 = _findLastMaybeArray(_ref8)) === void 0 ? dfltE() : _ref9),
  _ref10 = _ref8,
  fli = null == _ref10 ? _ref10[""] : (e5(), _findLastIndexMaybeArray(_ref10));
const {
  [(e6(), 'toSorted')]: ts = dfltF(),
  ...restF
} = recvF;

// Multiple properties share one captured receiver and retain their native key, read
// and default order in the declaration.
const _ref11 = [9],
  w7 = null == _ref11 ? _ref11[""] : (e7(), (_ref12 = _withMaybeArray(_ref11)) === void 0 ? dfltG() : _ref12),
  _ref13 = _ref11,
  t8 = null == _ref13 ? _ref13[""] : (e8(), _toSplicedMaybeArray(_ref13));
export { a, f, i, toReversed, other, fl, fli, ts, restF, w7, t8 };