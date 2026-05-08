import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _Array$from from "@core-js/pure/actual/array/from";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
// Three Array narrowing mechanics combine in one chain: TS annotation, runtime guard, built-in return.
// Each receiver must resolve via its own source so per-call array-instance polyfills emit precisely.
function aggregate(typed: number[], maybe: unknown, raw: Iterable<number>): number[] {
  var _ref, _ref2;
  if (!Array.isArray(maybe)) return [];
  const fromTyped = _filterMaybeArray(typed).call(typed, x => x > 0);
  const fromGuard = _mapMaybeArray(maybe).call(maybe, x => Number(x));
  const fromIter = _flatMapMaybeArray(_ref = _Array$from(raw)).call(_ref, x => [x, -x]);
  return _toSortedMaybeArray(_ref2 = _concatMaybeArray(fromTyped).call(fromTyped, fromGuard, fromIter)).call(_ref2, (a, b) => a - b);
}