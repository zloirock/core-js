import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// destructure with TS `as` cast on init expression: the cast is peeled and the
// destructure receivers route through pure-mode polyfills normally.
const at = _atMaybeArray(arr as number[]);