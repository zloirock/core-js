import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// two adjacent polyfilled props (`from`, `of`) + computed-key sibling: both keys land in
// one synthesized default literal and the computed sibling re-reads its key off the raw
// receiver - adjacency must not perturb the emitted literal or the import pair
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