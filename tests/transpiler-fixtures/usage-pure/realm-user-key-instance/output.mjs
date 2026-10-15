import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _self from "@core-js/pure/actual/self";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref, _ref2, _ref3, _ref4;
// User keys on a realm can contain instances; they do not name built-in namespaces.
// Dispatch uses each runtime value once and preserves defaults and optional receiver spelling.
// Prefixes may sit in the receiver, its member read or ahead of its default guard, once.
const at = _at(_globalThis.Data);
let includes;
includes = _includes(_globalThis.data);
const flat = (_ref = _flatMaybeArray((/* receiver prefix */touch(), _globalThis.Data))) === void 0 ? /* method default */fallback() : _ref;
const findLast = _findLastMaybeArray(_globalThis.Data);
const {
  sibling
} = _globalThis;
const map = (_ref2 = _mapMaybeArray(_globalThis.Data)) === void 0 ? fallback() : _ref2;
const filter = _filterMaybeArray(_self.Data);
const [,] = [_globalThis];
const flatMap = _flatMapMaybeArray((_ref3 = _globalThis.Data) === void 0 ? fallback() : _ref3);
const join = _joinMaybeArray((_ref4 = _self.Data) === void 0 ? fallback() : _ref4);
const findLastIndex = _findLastIndexMaybeArray(_globalThis.data);
const toReversed = _toReversedMaybeArray((true ? _globalThis : {}).Data);
const toSorted = _toSortedMaybeArray((touch(), _globalThis.data));
const toSpliced = _toSplicedMaybeArray((touch(), _globalThis).Data);
const realm = _globalThis;
const find = _findMaybeArray(realm.data);
for (const _ref5 of [_globalThis]) {
  const findIndex = _findIndexMaybeArray(_ref5.Data);
  consume(findIndex);
}
// A known namespace keeps the symbol key and its live default.
let iterator;
({
  [_Symbol$iterator]: iterator = null
} = _globalThis.Object);
export { at, includes, flat, findLast, sibling, map, filter, find, iterator };