// Conditional infer-pattern `T extends Array<infer U> ? U[] : string` must verify the
// CHECK type belongs to the matched container family before binding U. `string` is not an
// Array, so `Cross<string>` resolves to the FALSE branch (`string`), and `r.at(0)` is a
// string .at (_atMaybeString) - not the array .at the true branch (U[]) would imply.
type Cross<T> = T extends Array<infer U> ? U[] : string;
declare const r: Cross<string>;
r.at(0);
