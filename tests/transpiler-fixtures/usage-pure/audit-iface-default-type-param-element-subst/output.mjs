import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// type param `T = string` default kicks in when usage omits the arg (`const x: MyArr`).
// the substitution must fall back to the declared default for a missing usage arg, so the
// parent ref's `T` becomes `string` and element resolution dispatches the string-specific
// helper instead of the generic one.
interface MyArr<T = string> extends Array<T> {}
declare const x: any;
const [first]: MyArr = x;
_atMaybeString(first).call(first, 0);