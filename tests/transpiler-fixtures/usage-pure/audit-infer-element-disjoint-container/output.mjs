import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// an `infer U` conditional matches only when the check side container matches the pattern container.
// the injected helper variant reveals the inferred element type: a disjoint container (`Set` against
// `Array<infer U>`) makes the conditional FALSE -> never, so no helper is injected (U is NOT bound
// from the wrong container); the same-container case binds precisely (number[] -> array `includes`);
// and a `Readonly` variant shares its mutable form's element (`Set` IS-A `ReadonlySet`, U=string -> string `at`)
type ArrElem<T> = T extends Array<infer U> ? U : never;
type SetElem<T> = T extends Set<infer U> ? U : never;
type ROSetElem<T> = T extends ReadonlySet<infer U> ? U : never;
declare const disjoint: ArrElem<Set<string>>;
declare const matched: SetElem<Set<number[]>>;
declare const variance: ROSetElem<Set<string>>;
const a = disjoint.at(0);
const b = _includesMaybeArray(matched).call(matched, 1);
const c = _atMaybeString(variance).call(variance, 0);
export { a, b, c };