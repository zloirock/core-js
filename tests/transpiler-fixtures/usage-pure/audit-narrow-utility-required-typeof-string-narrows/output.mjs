import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Required<T> still names an arbitrary object surface; required-ness affects the
// inner property modality only. typeof guard must refine the receiver to string
// the same as Partial / Readonly / Record / NonNullable. Method choice is `at`
// which is shared by string and array so the polyfill import alone differentiates
// the Maybe-string variant produced by the narrow.
function probe(input: Required<Record<string, unknown>>) {
  // @ts-expect-error a guard the annotation rules out leaves tsc a never type, and the read sees the runtime value
  if (typeof input === "string") return _atMaybeString(input).call(input, 0);
  return null;
}

// @ts-expect-error the call supplies nothing, so only the annotation types the parameter
probe();