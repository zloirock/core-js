// method-form non-first-arg predicate: `obj.check(opts, x): x is unknown[]`. method
// signatures store params under `parameters` (not `params`); matchPredicateArg's
// dual-slot lookup (`node?.params ?? node?.parameters`) handles both shapes uniformly
declare const obj: {
  check(opts: object, x: unknown): x is unknown[];
};

function take(opts: object, input: unknown) {
  if (obj.check(opts, input)) {
    return input.at(0);
  }
}
