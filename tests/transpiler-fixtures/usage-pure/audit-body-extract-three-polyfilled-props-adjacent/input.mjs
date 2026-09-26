// An unknown computed sibling prevents a mirror. All calls use the default,
// so the three adjacent statics extract into the body independently.
const SYM = Symbol();
function run({ from, of, fromAsync, [SYM]: x } = Array) {
  return [from, of, fromAsync, x];
}
run();
