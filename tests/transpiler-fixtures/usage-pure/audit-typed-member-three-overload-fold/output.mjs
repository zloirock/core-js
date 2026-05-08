import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// `Reg.get` has three overloads (string, string, string[]); divergent return constructors cannot fold.
// Resolution must pick the first overload deterministically so the receiver narrows to string.
interface Reg {
  get(k: 'a'): string;
  get(k: 'b'): string;
  get(k: 'c'): string[];
}
declare const reg: Reg;
_atMaybeString(_ref = reg.get('a')).call(_ref, 0);
_includesMaybeString(_ref2 = reg.get('b')).call(_ref2, 'z');
reg.get('c').findLast(x => x);