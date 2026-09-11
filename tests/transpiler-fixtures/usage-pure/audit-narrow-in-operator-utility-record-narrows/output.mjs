// `key in input` is not recognised as a narrowing guard, so the receiver stays at the
// open Record<string, unknown> surface. With value type `unknown` and no narrow, there
// is no shape to dispatch `at` against, so the call is left untouched with no polyfill
// import. `at` is shared by string and array; absence of a Maybe-variant import is the lock.
function probe(input: Record<string, unknown>) {
  if ("at" in input) return input.at(0);
  return null;
}
probe();