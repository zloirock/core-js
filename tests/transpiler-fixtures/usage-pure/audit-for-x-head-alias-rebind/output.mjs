import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a for-x HEAD is a real write of the loop variable (it assigns every iteration, and the
// binding survives past the loop), and parsers record it UNEVENLY (babel: init-less head
// declarator; estree: nothing) - the canonical write scan poisons the alias on both. the
// INIT value may still swap to the polyfill (pre-loop reads win, the rebind owns every
// later read), but USES stay raw and the alias must never feed value folds or type trust
var from = _Array$from;
for (var from in {
  a: 1
}) {
  void from;
}
export const rebound = from;
var of = _Array$of;
for (var of of ['x']) {
  void of;
}
export const rebound2 = of;

// control: an un-rebound alias extracts
var fromAsync = _Array$fromAsync;
export const kept = fromAsync;

// a SIBLING function's same-named for-x head is a different binding - the canonical write
// scan stays function-scoped and must not poison this alias
function outer() {
  var groupBy = _Map$groupBy;
  return groupBy;
}
function other() {
  for (var groupBy in {
    a: 1
  }) {
    void groupBy;
  }
}
export const isolated = [outer(), other()];