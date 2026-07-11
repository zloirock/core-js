// shorthand-with-default `{from = []}` + computed-key sibling: the default swaps to a
// synthesized literal where the polyfilled key supplies the pure binding - the polyfill
// wins over the inner `= []` default when the caller passes nothing (polyfill-always-wins
// contract, babel-parity), and the computed sibling re-reads its key off the raw receiver
const TAG = 't';
function run({ from = [], [TAG]: tag } = Array) {
  return [from, tag];
}
run();
