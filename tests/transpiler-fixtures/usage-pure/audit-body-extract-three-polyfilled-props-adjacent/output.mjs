import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// three adjacent polyfilled props + computed-key sibling. `getPropRemovalRange`'s uniform
// "trailing-comma except last" rule must scale: idx=0 -> [from.start, of.start),
// idx=1 -> [of.start, fromAsync.start), idx=2 -> [fromAsync.start, [SYM].start). all three
// ranges are contiguous but non-overlapping; pre-fix the idx>0 leading-comma rule had
// adjacent removals fight for the middle commas. uses three distinct methods (.from / .of /
// .fromAsync) so the imports identify which line triggered which
const SYM = _Symbol();
function run({
  from,
  of,
  fromAsync,
  [SYM]: x
} = {
  from: _Array$from,
  of: _Array$of,
  fromAsync: _Array$fromAsync,
  [SYM]: Array[SYM]
}) {
  return [from, of, fromAsync, x];
}
run();