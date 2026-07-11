import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// three adjacent polyfilled props + computed-key sibling scale the synthesized default
// literal. three distinct methods (.from / .of / .fromAsync) so the imports identify
// which key triggered which entry
const SYM = _Symbol();
function run({
  from,
  of,
  fromAsync,
  [SYM]: x
} = {
  from: _Array$from,
  of: _Array$of,
  fromAsync: _Array$fromAsync,
  [SYM]: Array[SYM]
}) {
  return [from, of, fromAsync, x];
}
run();