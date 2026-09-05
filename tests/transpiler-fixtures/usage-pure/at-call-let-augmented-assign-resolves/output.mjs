import _atMaybeString from "@core-js/pure/actual/string/instance/at";
let x = 'hello';
x += ' world';
_atMaybeString(x).call(x, -1);