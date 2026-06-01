import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `Record<string, V>[string]` resolves its value type V like a literal string index
// signature: the synthetic Record index signature carries a string key parameter so the
// indexed-access value lookup matches and the array-specific at variant is selected
type R = Record<string, number[]>;
declare const x: R[string];
const r = _atMaybeArray(x).call(x, 0);
export { r };