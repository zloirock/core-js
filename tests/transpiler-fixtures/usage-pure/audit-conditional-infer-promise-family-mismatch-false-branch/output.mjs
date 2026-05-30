import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Promise is a collection-family infer container: a primitive check side is disjoint from it.
// `string` is iterable but is NOT a Promise, so `C<string>` resolves to the FALSE branch
// (`string`), and `r.at(0)` is the string .at (_atMaybeString). Without the family check the
// iterable string check side would bind U and wrongly pick the true branch (U[] -> array .at).
type C<T> = T extends Promise<infer U> ? U[] : string;
declare const r: C<string>;
_atMaybeString(r).call(r, 0);