import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// alias body wraps its type param inside a known collection (`type X<T> = Set<T>`).
// the path goes through `resolveElementType` for a Set destructure -- a non-Array
// known collection -- exercising the alias-body subst step on a distinct branch from
// the Array fixtures.
type MySet<T> = Set<T>;
declare const x: any;
const [first]: MySet<string> = x;
_atMaybeString(first).call(first, 0);