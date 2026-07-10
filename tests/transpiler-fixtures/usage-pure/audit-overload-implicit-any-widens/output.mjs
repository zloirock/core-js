import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// an implicit-any overload arm (no return annotation) stays IN the overload set: TS types
// a call routed to it as `any`, so the surviving annotated arm must not narrow the call
// to its family (wrong-Maybe on the real value, ie:11). interface and declare-class forms
interface Parser {
  parse(x: string): string[];
  parse(x: number);
}
declare const p: Parser;
export const viaInterface = _at(_ref = p.parse(123)).call(_ref, 0);
declare class Codec {
  decode(x: number);
  decode(x: string): number[];
}
declare const c: Codec;
export const viaDeclareClass = _includes(_ref2 = c.decode(5)).call(_ref2, 1);

// a fully-annotated set still arg-narrows precisely
interface Parser2 {
  parse(x: string): string[];
  parse(x: number): string[];
}
declare const p2: Parser2;
export const viaAnnotatedPair = _atMaybeArray(_ref3 = p2.parse(123)).call(_ref3, 0);