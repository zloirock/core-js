// `key in input` is not currently recognised as a narrowing guard for typeof /
// instanceof dispatch, so the typed receiver stays at the open Record<string,
// unknown> surface. With value type `unknown` and no narrow applied the resolver
// has no shape to dispatch `at` against and bails - so the call is left untouched
// without any polyfill import. Method `at` is shared by string and array; using
// it here keeps the fixture aligned with sibling utility-narrow fixtures while
// flagging the in-operator origin via the absence of a Maybe-variant import.
function probe(input: Record<string, unknown>) {
  if ("at" in input) return input.at(0);
  return null;
}
probe();