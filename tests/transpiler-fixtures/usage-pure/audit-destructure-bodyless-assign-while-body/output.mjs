import _Array$from from "@core-js/pure/actual/array/from";
// WhileStatement.body slot: the SE must execute on EACH iteration, not once before
// the loop. block-wrap places the SE-init expression inside the loop body alongside
// the polyfilled assignment. without the wrap, the SE would hoist past the loop to
// module scope and run exactly once.
let from;
while (cond) {
  sideEffect(), Array;
  from = _Array$from;
}