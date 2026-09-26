import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// An unknown computed sibling prevents a mirror. Closed default-only calls allow
// both statics to extract while the intervening length binding stays in the pattern.
const SYM = _Symbol();
function run({
  length,
  [SYM]: x
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, length, of, x];
}
run();