import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// polyfilled props at idx=0 and idx=2 with a NON-polyfilled survivor at idx=1, plus
// computed-key sibling at idx=3 to force body-extract (synth-swap bails on computed key).
// removal ranges must not consume the survivor: idx=0 -> [from.start, length.start)
// (trailing comma + survivor unaffected because range stops AT survivor start); idx=2 ->
// [length.end, [SYM].start) (trailing comma, since idx=2 has a next sibling now). survivor
// `length` stays in the pattern. uses `.from` and `.of` so the polyfill imports flag which
// lines emitted them; `length` is a non-polyfilled Array static property
const SYM = _Symbol();
function run({ length, [SYM]: x } = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, length, of, x];
}
run();