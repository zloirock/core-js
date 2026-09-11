// TS overload selection is FIRST-MATCH: an earlier arm with a top-typed param (`unknown`) accepts
// every argument, so it IS the selected one and the later keyword arm never wins - the call resolves
// to the first arm's string, never to the later arm's Maybe (ie:11 on that string)
declare function parse(input: unknown): string;
declare function parse(input: string): number[];
declare const s: string;
export const viaSubsumed = parse(s).at(0);

// a provably non-matching literal first arm (different primitive family) still lets the
// second arm select precisely
declare function tag(x: 'a'): string;
declare function tag(x: number): number[];
export const viaLiteralReject = tag(5).includes(1);
