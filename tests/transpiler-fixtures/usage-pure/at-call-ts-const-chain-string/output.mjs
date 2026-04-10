import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const a = 'hello';
const b = a;
const c = b;
_atMaybeString(c).call(c, -1);