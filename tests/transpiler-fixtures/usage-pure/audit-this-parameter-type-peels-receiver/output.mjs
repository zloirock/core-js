import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// ThisParameterType<typeof fn> peels fn's `this` pseudo-param type instead of a blanket Object bail,
// so a method on the receiver resolves precisely (`this: number[]` -> array `.at`, `this: string` -> string).
// previously both routed to Object and missed the polyfill entirely
function withArrayThis(this: number[]): void {}
function withStringThis(this: string): void {}
declare const arr: ThisParameterType<typeof withArrayThis>;
declare const str: ThisParameterType<typeof withStringThis>;
export const a = _atMaybeArray(arr).call(arr, 0);
export const b = _atMaybeString(str).call(str, 0);