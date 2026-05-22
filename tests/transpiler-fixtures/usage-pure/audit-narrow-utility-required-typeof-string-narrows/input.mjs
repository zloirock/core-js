// Required<T> still names an arbitrary object surface; required-ness affects the
// inner property modality only. typeof guard must refine the receiver to string
// the same as Partial / Readonly / Record / NonNullable. Method choice is `at`
// which is shared by string and array so the polyfill import alone differentiates
// the Maybe-string variant produced by the narrow.
function probe(input: Required<Record<string, unknown>>) {
  if (typeof input === "string") return input.at(0);
  return null;
}

probe();
