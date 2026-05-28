import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// 2-level nested SequenceExpression wrapping an AssignmentExpression destructure host:
// `(fxA(), (fxB(), ({Array: {from, of}} = globalThis)))`. cascade-emit lifts each SE
// prefix as a standalone ExpressionStatement and must emit them in source order
// (fxA, fxB) so observable side-effects on `calls` match the original SE evaluation
// semantics. inner-to-outer walker had reversed the prefix array
const calls = [];
function fxA() {
  _pushMaybeArray(calls).call(calls, 'A');
  return 0;
}
function fxB() {
  _pushMaybeArray(calls).call(calls, 'B');
  return 0;
}
let from, of;
fxA();
fxB();
from = _Array$from;
of = _Array$of;
[calls, from, of];