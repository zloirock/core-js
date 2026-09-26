// three adjacent polyfilled props + computed-key sibling scale the synthesized default
// literal. three distinct methods (.from / .of / .fromAsync) so the imports identify
// which key triggered which entry
const SYM = Symbol();
function run({ from, of, fromAsync, [SYM]: x } = Array) {
  return [from, of, fromAsync, x];
}
run();
