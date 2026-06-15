// `never` is the union identity in an Exclude source - it must be skipped so the surviving member
// resolves, instead of mismatching in the fold and bailing the whole result to a generic helper
type Kept = Exclude<number[] | never, string>;
declare const x: Kept;
const r = x.at(0);
export { r };
