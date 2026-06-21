// two adjacent polyfilled props (`from`, `of`) + computed-key sibling forces both into
// the body-extract path (synth-swap bails on a computed key). pre-fix the prop-removal
// ranges for adjacent props overlapped and fought over the middle comma; the uniform
// "trailing-comma except last" rule now keeps them non-overlapping
const SYM = Symbol();
function run({ from, of, [SYM]: x } = Array) {
  return [from, of, x];
}
run();
