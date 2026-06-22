import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3;
// TS selects an overload by ARGUMENT type, not declaration order. The resolver arg-matches the call args
// to each overload's primitive-keyword params: a number arg picks `parse(x: number)`, a string arg picks
// `parse(x: string)`. So the SAME downstream `.at` resolves to String.at (`_atMaybeString`) on `parse(123)`
// (number -> string) but Array.at (`_atMaybeArray`) on `parse('x')` (string -> string[]) - NOT a
// declaration-first guess that would dispatch the wrong type-specific helper (`_atMaybeArray` on a string
// value -> ie:11 throw). same arg-match for interface methods AND ambient `declare function` overloads.
// each line resolves to a distinct helper import so dispatch stays identifiable
interface Parser {
  parse(x: string): string[];
  parse(x: number): string;
}
declare const p: Parser;
_atMaybeString(_ref = p.parse(123)).call(_ref, 0);
_atMaybeArray(_ref2 = p.parse('x')).call(_ref2, 0);
declare function fparse(x: string): string[];
declare function fparse(x: number): string;
_includesMaybeString(_ref3 = fparse(0)).call(_ref3, 'a');