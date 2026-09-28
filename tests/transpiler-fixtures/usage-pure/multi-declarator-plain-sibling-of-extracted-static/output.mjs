import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A plain declarator beside a static destructuring: the declaration splits around the extracted
// static, and the plain sibling's own claims keep resolving through its binding - in a function,
// at module level and in an exported declaration.
export function last(csv) {
  const parts = String(csv).split(',');
  const keys = _Object$keys;
  return [_atMaybeArray(parts).call(parts, -1), keys(parts)];
}
export function flatten(list) {
  const copy = list;
  const from = _Array$from;
  return [_flatMaybeArray(copy).call(copy), from(copy)];
}
const nested = [[1]];
const of = _Array$of;
_flatMapMaybeArray(nested).call(nested, item => item);
of(1);
export const items = [1, 2];
export const entries = _Object$entries;
export const clone = items;
_includesMaybeArray(clone).call(clone, 2);
entries(clone);
// an exported array wrapper: a later declarator reads the extracted leaf's binding
let lastIndexOf = _findLastIndexMaybeArray([1]),
  lastIndex = lastIndexOf;
export { lastIndexOf, lastIndex };
const one = 1,
  sortedOf = _toSortedMaybeArray([1]),
  sorted = sortedOf;
export { one, sortedOf, sorted };
export const names = [_nameMaybeFunction(lastIndex), _nameMaybeFunction(sorted)];