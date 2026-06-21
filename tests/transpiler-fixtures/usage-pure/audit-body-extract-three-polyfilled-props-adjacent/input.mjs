// three adjacent polyfilled props + computed-key sibling. the prop-removal ranges must stay
// contiguous but non-overlapping as they scale; pre-fix the leading-comma rule for idx>0 had
// adjacent removals fight over the middle commas. three distinct methods (.from / .of /
// .fromAsync) so imports identify which line triggered which
const SYM = Symbol();
function run({ from, of, fromAsync, [SYM]: x } = Array) {
  return [from, of, fromAsync, x];
}
run();
