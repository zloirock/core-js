import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const [,, third] = ['a', 'b', 'c'];
_atMaybeString(third).call(third, 0);