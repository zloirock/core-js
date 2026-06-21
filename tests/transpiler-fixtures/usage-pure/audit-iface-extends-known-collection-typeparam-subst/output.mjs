import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// interface generic forwards its type param to a known-collection parent (`Array<T>`),
// reached via a pattern-level annotation (`const [first]: MyArr<string> = ...`). the
// caller's usage args must substitute into the parent ref, else `Array<T>` keeps `T`
// unbound and element resolution bails to generic `at`. with subst it becomes Array<string>.
interface MyArr<T> extends Array<T> {}
declare const x: any;
const [first]: MyArr<string> = x;
_atMaybeString(first).call(first, 0);