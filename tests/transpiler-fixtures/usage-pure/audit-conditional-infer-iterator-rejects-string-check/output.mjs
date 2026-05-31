import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `string` is NOT an `Iterator` (no `.next()`), so `T extends Iterator<infer U>` takes the FALSE
// branch and `r` resolves to `T` = string - the conditional is DECIDED, not abandoned. `r.at()` gets
// the string-specific `_atMaybeString`; binding U on a disjoint primitive would have wrongly emitted
// the array `_atMaybeArray`, and folding both branches with an unbound U would have lost the type to
// a generic-instance bail. only the minimal `Iterable` admits a string check side.
type Bug<T> = T extends Iterator<infer U> ? U[] : T;
declare const r: Bug<string>;
_atMaybeString(r).call(r, 0);