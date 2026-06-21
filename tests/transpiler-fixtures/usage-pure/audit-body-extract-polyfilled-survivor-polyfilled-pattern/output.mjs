import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// polyfilled props at idx 0 and 2 with a NON-polyfilled survivor `length` at idx 1, plus a
// computed-key sibling at idx 3 to force body-extract (synth-swap bails on computed key). each
// prop-removal range must stop AT the survivor's boundary so `length` stays in the pattern. uses
// `.from` and `.of` so the polyfill imports flag which line emitted them.
const SYM = _Symbol();
function run({
  from,
  length,
  of,
  [SYM]: x
} = {
  from: _Array$from,
  length: Array.length,
  of: _Array$of,
  [SYM]: Array[SYM]
}) {
  return [from, length, of, x];
}
run();