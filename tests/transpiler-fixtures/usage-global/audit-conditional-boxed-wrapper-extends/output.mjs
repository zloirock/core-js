import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.join";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.join";
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
matched.at(0);
mismatched.includes("a");
contained.find(x => x);
wide.join("-");