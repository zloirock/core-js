import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// type alias generic body references its declaration's type param (`type X<T> = Array<T>`).
// destructuring through a pattern-level annotation forces resolution via `resolveElementType`
// -> `resolveUserTypeElement` (which is what handles user-named aliases). without substituting
// the caller's usage args into the alias body, `Array<T>` keeps `T` unbound and resolution
// bails to generic `at` instead of the string-specific helper.
type MyArr<T> = Array<T>;
declare const x: any;
const [first]: MyArr<string> = x;
_atMaybeString(first).call(first, 0);