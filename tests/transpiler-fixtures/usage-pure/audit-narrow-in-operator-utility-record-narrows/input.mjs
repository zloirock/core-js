// `key in input` is not recognised as a narrowing guard, so the receiver stays at the
// open Record<string, unknown> surface. With value type `unknown` and no narrow, there
// is no shape to dispatch `at` against, so the call is left untouched with no polyfill
// import. `at` is shared by string and array; absence of a Maybe-variant import is the lock.
function probe(input: Record<string, unknown>) {
  // @ts-expect-error a call through a value tsc cannot call is the shape under test
  if ("at" in input) return input.at(0);
  return null;
}

// @ts-expect-error the call supplies nothing, so only the annotation types the parameter
probe();
