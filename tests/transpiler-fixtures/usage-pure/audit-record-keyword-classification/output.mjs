import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// param typed as `Record<string, unknown>` then narrowed via `typeof input ===
// 'string'`. the typeof guard must override the Record annotation and route to
// string-aware dispatch
function pick(input: Record<string, unknown>) {
  if (typeof input === 'string') {
    // @ts-expect-error a guard the annotation rules out leaves tsc a never type, and the read sees the runtime value
    return _atMaybeString(input).call(input, 0);
  }
  return null;
}