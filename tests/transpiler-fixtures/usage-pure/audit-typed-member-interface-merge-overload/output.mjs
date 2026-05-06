import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3;
// TS interface declaration merging: same name `Reg` declared twice. Each contributes
// methods that resolveTypedMember must enumerate via getTypeMembers. Merged signature
// list flows through resolveMemberCallReturnFromAnnotation which iterates over members.
// distinct methods so each line traces to its declaration's return shape
interface Reg {
  one(): string[];
}
interface Reg {
  two(): string;
}
declare const reg: Reg;
_findLastMaybeArray(_ref = reg.one()).call(_ref, x => x);
_atMaybeArray(_ref2 = reg.one()).call(_ref2, 0);
_includesMaybeString(_ref3 = reg.two()).call(_ref3, 'z');