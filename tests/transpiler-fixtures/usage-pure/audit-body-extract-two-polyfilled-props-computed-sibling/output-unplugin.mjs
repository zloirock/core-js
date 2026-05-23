import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// two adjacent polyfilled props (`from`, `of`) + computed-key sibling forces both into
// the body-extract path (synth-swap bails on computed key). pre-fix `getPropRemovalRange`
// returned overlapping ranges for adjacent removals - idx=0 took [from.start, of.start)
// and idx=1 took [from.end, of.end), fighting over the middle comma. now uniform
// "trailing-comma except last" rule keeps the ranges non-overlapping
const SYM = _Symbol();
function run({ [SYM]: x } = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, x];
}
run();