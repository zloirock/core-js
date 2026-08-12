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
export const a = numberFirst[opaqueKey].at(0);
interface StringFirst {
  [k: string]: number[] | string;
  [k: number]: number[];
}
declare const stringFirst: StringFirst;
export const b = stringFirst[opaqueKey].at(0);
interface OnlyString {
  [k: string]: number[];
}
declare const onlyString: OnlyString;
export const c = onlyString[opaqueKey].at(0);
export const d = numberFirst[0].at(0);
