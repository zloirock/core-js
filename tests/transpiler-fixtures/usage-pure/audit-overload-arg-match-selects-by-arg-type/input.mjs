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
p.parse(123).at(0);
p.parse('x').at(0);
declare function fparse(x: string): string[];
declare function fparse(x: number): string;
fparse(0).includes('a');
