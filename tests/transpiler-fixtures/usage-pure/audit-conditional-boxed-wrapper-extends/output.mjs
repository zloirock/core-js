import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A primitive is assignable to the wrapper it boxes into, so `string extends String` takes the
// TRUE branch, while a different wrapper or a concrete container takes the FALSE one and a wide
// `Object` stays undecided. One method per row keeps each branch attributable: `at` reads the
// matching-wrapper row, `includes` the mismatched one, `find` the container one, `join` the wide one.
type Match<T> = T extends String ? number[] : T;
type Mismatch<T> = T extends Number ? number[] : T;
type Contained<T> = T extends Array<number> ? number[] : T;
type Wide<T> = T extends Object ? number[] : T;
declare const matched: Match<string>;
declare const mismatched: Mismatch<string>;
declare const contained: Contained<string>;
declare const wide: Wide<string>;
_atMaybeArray(matched).call(matched, 0);
_includesMaybeString(mismatched).call(mismatched, "a");
contained.find(x => x);
_joinMaybeArray(wide).call(wide, "-");