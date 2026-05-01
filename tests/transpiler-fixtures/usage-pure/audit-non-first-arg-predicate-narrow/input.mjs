// non-first-arg predicate: `(opts, x): x is string` narrows the SECOND parameter, not the
// first. matchPredicateArg walks the function's params for the slot named `parameterName`
// (here 'x' -> index 1) and checks the call-arg at that position references the var. without
// this, the resolver assumed first-arg-only and silently lost narrowing for `(opts, x)` shapes
declare function isStrSecond(opts: object, x: unknown): x is string;

function take(opts: object, input: unknown) {
  if (isStrSecond(opts, input)) {
    return input.at(0);
  }
}
