import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// An enum member accessed through a zero-arg IIFE computed key (`Mode[(() => 'A')()]`) resolves to the
// member's literal value the same as `Mode.A` / `Mode['A']`: the IIFE folds to its returned static key,
// so the looked-up STRING enum value narrows the method to its string variant (an array-only method
// would resolve regardless and prove nothing). the dotted control line (`Mode.B`) proves the IIFE key
// folds to the SAME resolution as a plain member.
enum Mode {
  A = 'alpha',
  B = 'beta',
}
const iifeKeyFold = _includesMaybeString(_ref = Mode[(() => 'A')()]).call(_ref, 'lph');
const dottedControl = _atMaybeString(_ref2 = Mode.B).call(_ref2, 0);
export { iifeKeyFold, dottedControl };