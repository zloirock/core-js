import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// A bodyless `var` slot whose pattern a static claim consumes keeps only what its init still runs, in
// the init's live spelling, ahead of the bindings it fed: the prefix with its own claim served, and of
// a nav off a call that resolves to the realm only what that call owes - nothing for a quiet one -
// whether one claim empties the pattern or several do together.
const realm = () => _globalThis;
const stamp = () => (realm.count = 1, _globalThis);
const lists = [[1], [2]];
if (lists.length) {
  _flatMaybeArray(lists).call(lists);
  var groupBy = _Map$groupBy;
}
if (lists.length) {
  _atMaybeArray(lists).call(lists, 0), stamp();
  var from = _Array$from;
}
if (lists.length) var allSettled = _Promise$allSettled;
if (lists.length) var of = _Array$of;
if (lists.length) {
  _findLastIndexMaybeArray(lists).call(lists, Boolean), stamp();
  var entries = _Object$entries;
  var fromEntries = _Object$fromEntries;
}
if (lists.length) var values = _Object$values,
  hasOwn = _Object$hasOwn;
export { groupBy, from, allSettled, of, entries, fromEntries, values, hasOwn };