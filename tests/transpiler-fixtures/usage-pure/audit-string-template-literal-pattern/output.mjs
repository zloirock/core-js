import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `Uppercase<T>` always evaluates to a string subtype: instance calls on `u` pick the
// string-specific polyfill variant (parity with plain `string` typings).
declare const u: Uppercase<'hello'>;
_atMaybeString(u).call(u, -1);
_includesMaybeString(u).call(u, 'foo');