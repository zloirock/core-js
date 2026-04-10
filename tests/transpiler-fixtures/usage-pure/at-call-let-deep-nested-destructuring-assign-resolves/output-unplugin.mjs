import _atMaybeString from "@core-js/pure/actual/string/instance/at";
let c;
({ a: { b: { c } } } = { a: { b: { c: 'deep' } } });
_atMaybeString(c).call(c, -1);