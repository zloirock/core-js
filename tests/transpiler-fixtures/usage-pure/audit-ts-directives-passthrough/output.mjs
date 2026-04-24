import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
// TS type-checker directives (`@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`) are
// erased at type-check time. the plugin must still polyfill the underlying runtime code;
// the comments themselves pass through to the output with their original positions
// @ts-ignore
const a: number[] = [1, 2, 3];
_atMaybeArray(a).call(a, -1);

// @ts-expect-error something
const b: string[] = ['x'];
_atMaybeArray(b).call(b, 0);
new _Map();