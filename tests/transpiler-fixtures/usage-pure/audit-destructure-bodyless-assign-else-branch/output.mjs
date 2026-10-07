import _Array$from from "@core-js/pure/actual/array/from";
// IfStatement.alternate slot: the same as the consequent slot. the SE-prefixed static-value receiver
// lives in the `else` body, so the SE and the polyfilled assignment stay in that slot as one sequence:
// the SE runs only on `!cond` rather than leaking to module scope.
let from;
if (cond) noop();else sideEffect(), from = _Array$from;