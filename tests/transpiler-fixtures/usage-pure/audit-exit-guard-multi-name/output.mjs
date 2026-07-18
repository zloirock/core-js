import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// one early-exit condition guarding TWO bindings: each De Morgan arm narrows its own
// variable after the exit - the `at` read dispatches the string variant, the `includes`
// read binds the string variant of ITS OWN binding
declare const a: string | string[];
declare const b: string | number[];
if (typeof a !== 'string' || typeof b !== 'string') throw new Error('shape');
export const r1 = _atMaybeString(a).call(a, 0);
export const r2 = _includesMaybeString(b).call(b, 'b');