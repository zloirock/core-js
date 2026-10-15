import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref2, _ref3, _ref5;
// A user slot off top-level this can hold an instance, regardless of the key's case.
// Unknown values take generic dispatch through aliases and loop heads, preserving the capture.
// A prefix stays in the receiver/member read or leads the default guard, once.
const at = _at(this.Data);
const includes = _includes(this.data);
let flat;
flat = _flatMaybeArray(this.Data);
const read = () => {
  const findLast = _findLastMaybeArray(this.data);
  return findLast;
};
const _ref = this;
const map = _mapMaybeArray(_ref.Data);
const {
  sibling
} = _ref;
const realm = this;
const filter = _filterMaybeArray(realm.data);
const join = (_ref2 = _joinMaybeArray((/* receiver prefix */touch(), this.Data))) === void 0 ? /* method default */fallback(/*#__PURE__*/_toSortedMaybeArray(_ref3 = getA()).call(_ref3)) : _ref2;
for (const _ref4 of [this]) {
  const find = _findMaybeArray(_ref4.Data);
  consume(find);
}
function capturedRealm() {
  const findIndex = _findIndexMaybeArray(realm.data);
  return findIndex;
}
function ownReceiver() {
  const flatMap = _flatMapMaybeArray(this.Data);
  return flatMap;
}
// An unknown slot still dispatches its iterable instance before the leaf default.
let iterator;
iterator = (_ref5 = _getIteratorMethod(this.Data)) === void 0 ? null : _ref5;
export { at, includes, flat, read, map, filter, sibling, capturedRealm, ownReceiver, iterator };