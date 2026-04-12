import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const str = String.fromCharCode(65);
_atMaybeString(str).call(str, 0);