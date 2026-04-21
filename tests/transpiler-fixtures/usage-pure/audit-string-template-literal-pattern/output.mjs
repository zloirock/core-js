import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `Uppercase<T>` / `Lowercase<T>` always evaluate to string per hardcoded branch
// in resolveNamedType. expect string-specific polyfill.
declare const u: Uppercase<'hello'>;
_atMaybeString(u).call(u, -1);
_includesMaybeString(u).call(u, 'foo');