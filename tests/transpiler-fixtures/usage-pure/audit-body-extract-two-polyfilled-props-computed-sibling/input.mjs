// two adjacent polyfilled props (`from`, `of`) + computed-key sibling: both keys land in
// one synthesized default literal and the computed sibling re-reads its key off the raw
// receiver - adjacency must not perturb the emitted literal or the import pair
const SYM = Symbol();
function run({ from, of, [SYM]: x } = Array) {
  return [from, of, x];
}
run();
