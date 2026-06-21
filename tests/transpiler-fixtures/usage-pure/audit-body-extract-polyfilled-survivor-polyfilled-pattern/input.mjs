// polyfilled props at idx 0 and 2 with a NON-polyfilled survivor `length` at idx 1, plus a
// computed-key sibling at idx 3 to force body-extract (synth-swap bails on computed key). each
// prop-removal range must stop AT the survivor's boundary so `length` stays in the pattern. uses
// `.from` and `.of` so the polyfill imports flag which line emitted them.
const SYM = Symbol();
function run({ from, length, of, [SYM]: x } = Array) {
  return [from, length, of, x];
}
run();
