import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// An enum member accessed through a SIDE-EFFECTING computed key (`Mode[(c++, 'A')]`) resolves to the
// member's literal value the same as `Mode.A` / `Mode['A']`: the SE prefix folds to the static tail key,
// so the looked-up STRING enum value narrows the method to its string variant (an array-only method would
// resolve regardless and prove nothing). the SE prefix is memoized to run once. the dotted control line
// (`Mode.B`) proves the SE-key folds to the SAME resolution as a plain member.
enum Mode { A = 'alpha', B = 'beta' }
let c = 0;
const seKeyFold = _includesMaybeString(_ref = Mode[(c++, 'A')]).call(_ref, 'lph');
const dottedControl = _atMaybeString(_ref2 = Mode.B).call(_ref2, 0);
export { seKeyFold, dottedControl, c };