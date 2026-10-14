import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sortMaybeArray from "@core-js/pure/actual/array/instance/sort";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
var _ref6, _ref8;
// A claim beside a nested level that claims too reads the one memo of the receiver: a member or call
// root is read once, and every claim dispatches off that read in source order - a defaulted nested
// claim too, its guard reading the dispatch. A nested claim written right after a plain one joins its
// declaration; written first, it binds on its own.
class Store {
  view() {
    const _ref = this.state;
    const filter = _filterMaybeArray(_ref),
      sort = _sortMaybeArray(_ref.options);
    return [filter, sort];
  }
}
const _ref2 = holder.page;
const keys = _keys(_ref2),
  at = _at(_ref2.data);
const _ref3 = load();
const entries = _entries(_ref3);
const values = _values(_ref3),
  flat = _flatMaybeArray(_ref3.list);
const _ref4 = holder.page;
const includes = _includes(_ref4.rows);
const findLast = _findLastMaybeArray(_ref4);
const _ref5 = holder.page;
const toSpliced = _toSplicedMaybeArray(_ref5),
  findLastIndex = (_ref6 = _findLastIndexMaybeArray(_ref5.picked)) === void 0 ? null : _ref6;
const _ref7 = load();
const toReversed = _toReversedMaybeArray(_ref7),
  toSorted = (_ref8 = _toSortedMaybeArray(_ref7.sorted)) === void 0 ? null : _ref8;
use(new Store(), keys, at, entries, values, flat, includes, findLast, toSpliced, findLastIndex, toReversed, toSorted);