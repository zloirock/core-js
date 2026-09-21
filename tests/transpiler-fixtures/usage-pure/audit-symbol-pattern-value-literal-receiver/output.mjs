import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref, _ref4, _ref6, _ref8, _ref11, _ref12, _ref13, _ref15, _ref16, _ref17, _ref18;
// Nested Symbol.iterator pattern values keep inner defaults and their polyfills intact.
// Literal and member receivers preserve property order across sibling properties,
// computed keys, declaration hosts and deeper nested patterns.
// Each receiver is evaluated once and unrelated receiver captures remain independent.

// A literal receiver combines an inner polyfillable default with a sibling property.
const _ref2 = [1, 2, 3],
  {
    next = _flatMaybeArray(_ref = [1]).call(_ref)
  } = null == _ref2 ? _ref2[""] : _getIteratorMethod(_ref2),
  {
    other
  } = _ref2;
export const viaLiteralDefault = [next, other];

// A nested name read keeps the iterator function name available.
const _ref3 = [4, 5];
const iterName = _nameMaybeFunction(null == _ref3 ? _ref3[""] : _getIteratorMethod(_ref3));
const {
  second
} = _ref3;
export const viaLiteralNoDefault = [iterName, second];

// A plain instance leaf beside a pattern value uses the same captured receiver.
const _ref5 = [1, [2]];
const {
  length: arity = _atMaybeArray(_ref4 = [6]).call(_ref4, 0)
} = null == _ref5 ? _ref5[""] : _getIteratorMethod(_ref5);
const f = _flatMaybeArray(_ref5);
export const viaMixedLeaf = [arity, f];

// A member receiver is read once before nested extraction.
const _ref7 = holder.list,
  {
    next: memberNext = _flatMaybeArray(_ref6 = [7]).call(_ref6)
  } = null == _ref7 ? _ref7[""] : _getIteratorMethod(_ref7),
  {
    tail
  } = _ref7;
export const viaMemberControl = [memberNext, tail];

// An effect inside the inner default runs once, with its inner polyfill preserved.
let se = () => {};
const _ref9 = [8, 9],
  {
    next: seNext = (se(), _toReversedMaybeArray(_ref8 = [1]).call(_ref8))
  } = null == _ref9 ? _ref9[""] : _getIteratorMethod(_ref9),
  {
    third
  } = _ref9;
export const viaSeDefault = [seNext, third];

// A computed sibling key runs before the following iterator read and nested default.
let k = () => 'of';
const _ref10 = [3, 4];
const {
  [k()]: kf
} = _ref10;
const nm = (_ref11 = _nameMaybeFunction(null == _ref10 ? _ref10[""] : _getIteratorMethod(_ref10))) === void 0 ? _atMaybeArray(_ref12 = [2]).call(_ref12, 0) : _ref11;
export const viaSeKeySibling = [kf, nm];

// Declaration kinds and neighboring declarators retain source order for nested extraction.
var _ref14 = [10, 11],
  {
    next: varNext = _withMaybeArray(_ref13 = [1]).call(_ref13, 0, 2)
  } = null == _ref14 ? _ref14[""] : _getIteratorMethod(_ref14),
  {
    fifth
  } = _ref14;
export const viaVarKind = [varNext, fifth];
const before = 1;
const {
  name: midName = _entriesMaybeArray(_ref15 = [2]).call(_ref15)
} = _getIteratorMethod([12]);
const after = 2;
export const viaMultiDecl = [before, midName, after];

// Nested defaults keep their polyfills through deeper pattern values.
const {
  next: {
    length: deepLen = _toSplicedMaybeArray(_ref16 = [1]).call(_ref16, 0, 1)
  }
} = _getIteratorMethod([13]);
export const viaDeepNesting = deepLen;

// Two literal receivers in one declaration keep independent captures.
const {
  next: nx = _findLastMaybeArray(_ref17 = [1]).call(_ref17, Boolean)
} = _getIteratorMethod([14]);
const {
  name: ny = _findLastIndexMaybeArray(_ref18 = [2]).call(_ref18, Boolean)
} = _getIteratorMethod([15]);
export const viaTwoMemos = [nx, ny];