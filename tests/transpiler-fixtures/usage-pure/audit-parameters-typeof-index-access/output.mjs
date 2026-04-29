import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// TypeScript `Parameters<typeof fn>[1]` resolves the second parameter's type to `string`,
// so `.at(0)` lands on the String-specific polyfill.
declare function fn(x: number, y: string, z: boolean): void;
declare const second: Parameters<typeof fn>[1];
_atMaybeString(second).call(second, 0);