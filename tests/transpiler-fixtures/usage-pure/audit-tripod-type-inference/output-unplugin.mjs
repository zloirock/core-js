import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _Array$from from "@core-js/pure/actual/array/from";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
// three mechanics, three intermediates - each receiver's type comes from exactly
// one source. in usage-pure mode the module registry has no iterator/instance
// override for `.filter` / `.map` / `.flatMap` (iterator helpers flow through a
// separate entry), so every receiver resolves to `array/instance/*`; the chain
// still exercises all three mechanics for TS / guard / built-in inference:
//   (1) TS annotation `typed: number[]`   -> .filter receiver is Array
//   (2) guard `Array.isArray(maybe)`      -> .map    receiver is Array
//   (3) built-in return of `Array.from`   -> .flatMap receiver is Array
function aggregate(typed: number[], maybe: unknown, raw: Iterable<number>): number[] {
var _ref, _ref2;
  if (!Array.isArray(maybe)) return [];
  const fromTyped = _filterMaybeArray(typed).call(typed, x => x > 0);
  const fromGuard = _mapMaybeArray(maybe).call(maybe, x => Number(x));
  const fromIter = _flatMapMaybeArray(_ref = _Array$from(raw)).call(_ref, x => [x, -x]);
  return _toSortedMaybeArray(_ref2 = _concatMaybeArray(fromTyped).call(fromTyped, fromGuard, fromIter)).call(_ref2, (a, b) => a - b);
}