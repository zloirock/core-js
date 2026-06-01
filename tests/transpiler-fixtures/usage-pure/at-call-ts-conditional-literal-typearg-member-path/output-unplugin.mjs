import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// literal type argument flowing through an object-member conditional (`C<2>` where
// `C<X> = { v: X extends 1 ? number[] : string }`): substituting the literal through the
// member keeps it precise, so `2 extends 1` is false and the value (string) selects the
// string-specific at variant
type C<X> = { v: X extends 1 ? number[] : string };
declare const o: C<2>;
const r = _atMaybeString(_ref = o.v).call(_ref, 0);
export { r };