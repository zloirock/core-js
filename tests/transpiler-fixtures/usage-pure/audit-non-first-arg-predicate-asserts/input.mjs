// non-first-arg `asserts x is T`: assertion-statement form narrows the binding from the
// call onward. parseAssertionStatementGuard now threads the full args list through
// resolvePredicateGuard so `assertStr(opts, input)` with `(opts, x): asserts x is string`
// narrows `input` (was first-arg-only and silently bailed)
declare function assertStr(opts: object, x: unknown): asserts x is string;

function take(opts: object, input: unknown) {
  assertStr(opts, input);
  return input.at(0);
}
