import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// type param `T = string` default kicks in when usage omits the arg (`const x: MyArr`).
// `buildSubstMap` falls back to `declParams[i].default` for missing usage args, so the
// parent ref's `T` substitutes to `string` and element resolution dispatches the string-
// specific helper instead of the generic one.
interface MyArr<T = string> extends Array<T> {}
declare const x: any;
const [first]: MyArr = x;
_atMaybeString(first).call(first, 0);