import _Array$from from "@core-js/pure/actual/array/from";
// IIFE callee wrapped in a SequenceExpression with a side-effecting prefix:
// `((logCall(), arrow))(Array)`. the SE-prefix runs at its position; the sequence's
// tail IS the invoked arrow, so the call-arg `Array` is still synth-swap reachable.
// expected: `Array` replaced with the synthetic polyfill object, `logCall()` preserved
(logCall(), ({
  from
}) => from)({
  from: _Array$from
});
// minifier-emitted `(0, fn)(arg)` shape - SE prefix is the literal `0`, no side effect.
// `at` is a static-undefined receiver (no `Array.at` constructor static), no emission
(0, ({
  at
}) => at)(Array);