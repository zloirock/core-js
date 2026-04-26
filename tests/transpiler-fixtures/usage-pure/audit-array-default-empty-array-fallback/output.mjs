import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// array-destructure with default value: `a` falls back to a string fallback, the
// subsequent instance call is rewritten via the pure-mode generic instance polyfill.
const [a = 'fallback'] = [];
_atMaybeString(a).call(a, 0);