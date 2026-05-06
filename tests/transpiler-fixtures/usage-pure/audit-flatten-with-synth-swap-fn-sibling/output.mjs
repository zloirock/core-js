import _Array$of from "@core-js/pure/actual/array/of";
import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// proxy flatten + sibling that's a function with param synth-swap. param synth-swap emits
// transforms inside the sibling function-expression body. asserts these inner transforms
// do not collide with the multi-decl full-declaration overwrite
const helper = function ({
  of
} = {
  of: _Array$of
}) {
  return of(1, 2);
};
export { from, helper };