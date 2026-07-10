// an implicit-any overload arm (no return annotation) stays IN the overload set: TS types
// a call routed to it as `any`, so the surviving annotated arm must not narrow the call
// to its family (wrong-Maybe on the real value, ie:11). interface and declare-class forms
interface Parser {
  parse(x: string): string[];
  parse(x: number);
}
declare const p: Parser;
export const viaInterface = p.parse(123).at(0);

declare class Codec {
  decode(x: number);
  decode(x: string): number[];
}
declare const c: Codec;
export const viaDeclareClass = c.decode(5).includes(1);

// a fully-annotated set still arg-narrows precisely
interface Parser2 {
  parse(x: string): string[];
  parse(x: number): string[];
}
declare const p2: Parser2;
export const viaAnnotatedPair = p2.parse(123).at(0);
