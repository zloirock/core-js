import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// type alias generic body references its declaration's type param (`type X<T> = Array<T>`).
// destructuring through a pattern-level annotation must substitute the caller's `string`
// arg into the alias body; without it `Array<T>` keeps `T` unbound and resolution bails
// to generic `at` instead of the string-specific helper.
type MyArr<T> = Array<T>;
declare const x: any;
const [first]: MyArr<string> = x;
_atMaybeString(first).call(first, 0);