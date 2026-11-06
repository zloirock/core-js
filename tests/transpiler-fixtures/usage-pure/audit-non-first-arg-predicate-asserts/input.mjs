// non-first-arg `asserts x is T`: assertion-statement form narrows the binding from the
// call onward. the assertion-statement guard parsing now threads the full args list through
// the predicate-guard resolution so `assertStr(opts, input)` with `(opts, x): asserts x is string`
// narrows `input` (was first-arg-only and silently bailed)
declare function assertStr(opts: object, x: unknown): asserts x is string;

function take(opts: object, input: unknown) {
  assertStr(opts, input);
  return input.at(0);
}
