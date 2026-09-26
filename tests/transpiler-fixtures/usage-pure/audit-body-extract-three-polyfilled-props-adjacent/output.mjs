import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// An unknown computed sibling prevents a mirror. All calls use the default,
// so the three adjacent statics extract into the body independently.
const SYM = _Symbol();
function run({
  [SYM]: x
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  let fromAsync = _Array$fromAsync;
  return [from, of, fromAsync, x];
}
run();