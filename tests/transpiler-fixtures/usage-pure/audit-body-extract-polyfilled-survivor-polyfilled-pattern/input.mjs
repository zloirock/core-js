// An unknown computed sibling prevents a mirror. Closed default-only calls allow
// both statics to extract while the intervening length binding stays in the pattern.
const SYM = Symbol();
function run({ from, length, of, [SYM]: x } = Array) {
  return [from, length, of, x];
}
run();
