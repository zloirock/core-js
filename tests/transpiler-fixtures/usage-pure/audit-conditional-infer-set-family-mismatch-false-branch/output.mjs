import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Conditional infer-pattern `T extends Set<infer U> ? U[] : string` matches the extends-clause
// shape, but the true branch may only fire when the CHECK type belongs to the Set container
// family. `string` is iterable yet is NOT a Set, so `C<string>` must resolve to the FALSE
// branch (`string`), and `r.at(0)` is the string .at (_atMaybeString) - not the array .at the
// true branch (U[]) would imply if the iterable check side were wrongly bound for a collection.
type C<T> = T extends Set<infer U> ? U[] : string;
declare const r: C<string>;
_atMaybeString(r).call(r, 0);