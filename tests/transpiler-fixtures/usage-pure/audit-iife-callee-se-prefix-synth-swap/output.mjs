import _Array$from from "@core-js/pure/actual/array/from";
// IIFE callee wrapped in a SequenceExpression: `((logCall(), arrow))(Array)` passes
// `Array` to an arrow that destructures `.from`, so the call-arg is replaced with a
// synthetic `{ from: _Array$from }` and the side-effecting `logCall()` is preserved.
(logCall(), ({
  from
}) => from)({
  from: _Array$from
});
// Minifier-emitted `(0, fn)(arg)` shape: the prefix is the literal `0` (no side effect)
// and the destructured `.at` is not a known static on `Array`, so no polyfill is emitted.
(0, ({
  at
}) => at)(Array);