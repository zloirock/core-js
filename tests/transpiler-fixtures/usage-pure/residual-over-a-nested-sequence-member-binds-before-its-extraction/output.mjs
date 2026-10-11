import _Array$from from "@core-js/pure/actual/array/from";
// a residual reading off a member of a sequence nested in a sequence runs the inner effect before any
// binding of the declaration, so an extraction beside it binds after it, as for one sequence
var box = {
  y: Array
};
var {
  length
} = (0, b(), box).y;
var from = _Array$from;
export { from, length };