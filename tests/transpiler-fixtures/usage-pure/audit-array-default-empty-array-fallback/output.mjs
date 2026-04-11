import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const [a = 'fallback'] = [];
_atMaybeString(a).call(a, 0);