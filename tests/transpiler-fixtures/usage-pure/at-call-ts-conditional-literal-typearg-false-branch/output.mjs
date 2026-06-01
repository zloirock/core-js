import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// explicit literal type argument to a conditional-type alias (`C<2>` where
// `C<X> = X extends 1 ? number[] : string`): the literal is compared precisely so the
// false branch (string) is selected and the string-specific at variant is used
type C<X> = X extends 1 ? number[] : string;
declare const v: C<2>;
const r = _atMaybeString(v).call(v, 0);
export { r };