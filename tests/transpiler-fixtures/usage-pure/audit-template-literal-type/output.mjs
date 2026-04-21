import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// TSTemplateLiteralType resolves to $Primitive('string'); receiver => string-specific polyfill.
// .at(0) on string => _atMaybeString; .includes on string => _stringIncludes.
declare const s: `hello_${string}`;
_atMaybeString(s).call(s, 0);
_includesMaybeString(s).call(s, 'foo');