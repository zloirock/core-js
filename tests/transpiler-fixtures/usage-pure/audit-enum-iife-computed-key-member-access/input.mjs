// An enum member accessed through a zero-arg IIFE computed key (`Mode[(() => 'A')()]`) resolves to the
// member's literal value the same as `Mode.A` / `Mode['A']`: the IIFE folds to its returned static key,
// so the looked-up STRING enum value narrows the method to its string variant (an array-only method
// would resolve regardless and prove nothing). the dotted control line (`Mode.B`) proves the IIFE key
// folds to the SAME resolution as a plain member.
enum Mode { A = 'alpha', B = 'beta' }
const iifeKeyFold = Mode[(() => 'A')()].includes('lph');
const dottedControl = Mode.B.at(0);
export { iifeKeyFold, dottedControl };
