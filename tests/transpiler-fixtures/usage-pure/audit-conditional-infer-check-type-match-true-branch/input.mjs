// Positive counterpart: when the CHECK type DOES belong to the matched container family the
// true branch must still fire. `number[]` is an Array, so `Cross<number[]>` resolves to the
// TRUE branch (`U[]` = number[]), and `r.at(0)` is the array .at (_atMaybeArray). The
// check-type guard must not over-correct and drop this legitimate narrow.
type Cross<T> = T extends Array<infer U> ? U[] : string;
declare const r: Cross<number[]>;
r.at(0);
