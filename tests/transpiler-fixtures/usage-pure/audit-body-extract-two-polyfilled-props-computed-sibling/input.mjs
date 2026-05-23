// two adjacent polyfilled props (`from`, `of`) + computed-key sibling forces both into
// the body-extract path (synth-swap bails on computed key). pre-fix `getPropRemovalRange`
// returned overlapping ranges for adjacent removals - idx=0 took [from.start, of.start)
// and idx=1 took [from.end, of.end), fighting over the middle comma. now uniform
// "trailing-comma except last" rule keeps the ranges non-overlapping
const SYM = Symbol();
function run({ from, of, [SYM]: x } = Array) {
  return [from, of, x];
}
run();
