// Partial of a record carries the same arbitrary-object surface as Record itself.
// typeof guard must reach the string narrow despite the utility-type wrapping.
// `includes` is shared by string and array so the polyfill import alone reveals
// which Maybe-variant was selected after the narrow.
function probe(input: Partial<Record<string, number>>) {
  if (typeof input === "string") return input.includes("a");
  return null;
}

probe();
