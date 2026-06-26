// An enum member accessed through a SIDE-EFFECTING computed key (`Mode[(c++, 'A')]`) resolves to the
// member's literal value the same as `Mode.A` / `Mode['A']`: the SE prefix folds to the static tail key,
// so the looked-up STRING enum value narrows the method to its string variant (an array-only method would
// resolve regardless and prove nothing). the SE prefix is memoized to run once. the dotted control line
// (`Mode.B`) proves the SE-key folds to the SAME resolution as a plain member.
enum Mode { A = 'alpha', B = 'beta' }
let c = 0;
const seKeyFold = Mode[(c++, 'A')].includes('lph');
const dottedControl = Mode.B.at(0);
export { seKeyFold, dottedControl, c };
