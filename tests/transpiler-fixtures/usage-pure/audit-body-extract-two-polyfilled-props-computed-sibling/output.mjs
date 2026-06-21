import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// two adjacent polyfilled props (`from`, `of`) + computed-key sibling forces both into
// the body-extract path (synth-swap bails on a computed key). pre-fix the prop-removal
// ranges for adjacent props overlapped and fought over the middle comma; the uniform
// "trailing-comma except last" rule now keeps them non-overlapping
const SYM = _Symbol();
function run({
  from,
  of,
  [SYM]: x
} = {
  from: _Array$from,
  of: _Array$of,
  [SYM]: Array[SYM]
}) {
  return [from, of, x];
}
run();