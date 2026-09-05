import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// alias body wraps its type param inside a known collection (`type X<T> = Set<T>`).
// destructuring a Set -- a non-Array known collection -- exercises the alias-body type-param
// substitution on a distinct branch from the Array fixtures.
type MySet<T> = Set<T>;
declare const x: any;
const [first]: MySet<string> = x;
_atMaybeString(first).call(first, 0);