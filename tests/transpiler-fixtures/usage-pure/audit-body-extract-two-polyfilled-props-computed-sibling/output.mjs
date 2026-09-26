import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// An unknown computed sibling prevents a mirror. Both adjacent statics extract
// into the body because every call leaves the parameter to its default.
const SYM = _Symbol();
function run({
  [SYM]: x
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, x];
}
run();