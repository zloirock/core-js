// the declarator is guarded by TWO nested branches (if-in-if). the use sits at the function-body
// level, outside both, so neither branch contains it and usage-pure bails - covers the multi-guard
// containment check (every branch must contain the use)
function f() {
  if (a) {
    if (b) { var M = globalThis; }
  }
  M.Array.of([1]);
}
