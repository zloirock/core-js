// An unknown computed sibling prevents a mirror. Both adjacent statics extract
// into the body because every call leaves the parameter to its default.
const SYM = Symbol();
function run({ from, of, [SYM]: x } = Array) {
  return [from, of, x];
}
run();
