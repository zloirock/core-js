import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
declare function foo(): string[];
declare const x: ReturnType<typeof foo>;
_atMaybeArray(x).call(x, 0);