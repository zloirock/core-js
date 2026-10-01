import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `export declare function` (a type-only ambient declaration with rest param) must not
// emit any polyfill imports for the declaration itself; the standalone `x.at(0)` does.
export declare function fn(a: number, ...rest: string[]): void;
declare const x: Parameters<typeof fn>[1];
_atMaybeString(x).call(x, 0);