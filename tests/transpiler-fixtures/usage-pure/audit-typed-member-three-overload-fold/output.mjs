import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// resolveTypedMember overload precedence: three signatures of d.get returning string,
// string, string[]. resolveMemberCallReturnFromAnnotation collects all three resolved
// returns then runs foldUnionTypes. fold succeeds when constructors agree (Array vs
// Array vs string is divergent, but two strings + Array[] should still pick FIRST since
// fold can't unify primitive string with $Object Array). Lock the first-overload behaviour
interface Reg {
  get(k: 'a'): string;
  get(k: 'b'): string;
  get(k: 'c'): string[];
}
declare const reg: Reg;
_atMaybeString(_ref = reg.get('a')).call(_ref, 0);
_includesMaybeString(_ref2 = reg.get('b')).call(_ref2, 'z');
reg.get('c').findLast(x => x);