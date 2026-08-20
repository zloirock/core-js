import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `never` is the union identity in an Exclude source - it must be skipped so the surviving member
// resolves, instead of mismatching in the fold and bailing the whole result to a generic helper
type Kept = Exclude<number[] | never, string>;
declare const x: Kept;
const r = _atMaybeArray(x).call(x, 0);
export { r };