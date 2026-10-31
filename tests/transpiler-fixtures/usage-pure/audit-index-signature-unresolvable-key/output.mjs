import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4;
// a computed key whose type does not resolve can be any property key, so the value is the UNION of
// every index signature that could receive it - not whichever the source happens to declare first,
// and not one chosen kind. the two unresolvable rows carry the same signatures in opposite order
// and have to agree; a type with a SINGLE signature has no such question and still narrows; the
// last row is the control, where a resolvable numeric key picks the number signature on its own
interface NumberFirst {
  [k: number]: number[];
  [k: string]: number[] | string;
}
declare const numberFirst: NumberFirst;
declare const opaqueKey: any;
export const a = _at(_ref = numberFirst[opaqueKey]).call(_ref, 0);
interface StringFirst {
  [k: string]: number[] | string;
  [k: number]: number[];
}
declare const stringFirst: StringFirst;
export const b = _at(_ref2 = stringFirst[opaqueKey]).call(_ref2, 0);
interface OnlyString {
  [k: string]: number[];
}
declare const onlyString: OnlyString;
export const c = _atMaybeArray(_ref3 = onlyString[opaqueKey]).call(_ref3, 0);
export const d = _atMaybeArray(_ref4 = numberFirst[0]).call(_ref4, 0);