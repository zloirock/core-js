// three adjacent polyfilled props + computed-key sibling. `getPropRemovalRange`'s uniform
// "trailing-comma except last" rule must scale: idx=0 -> [from.start, of.start),
// idx=1 -> [of.start, fromAsync.start), idx=2 -> [fromAsync.start, [SYM].start). all three
// ranges are contiguous but non-overlapping; pre-fix the idx>0 leading-comma rule had
// adjacent removals fight for the middle commas. uses three distinct methods (.from / .of /
// .fromAsync) so the imports identify which line triggered which
const SYM = Symbol();
function run({ from, of, fromAsync, [SYM]: x } = Array) {
  return [from, of, fromAsync, x];
}
run();
