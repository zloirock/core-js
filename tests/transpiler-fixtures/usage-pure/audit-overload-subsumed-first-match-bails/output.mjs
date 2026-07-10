import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// TS overload selection is FIRST-MATCH: an earlier arm with a non-analyzable param
// (`unknown`) may be the TS-selected one, so a later keyword arm must not single-select -
// the divergent set widens to generic instead of the later arm's Maybe (ie:11 on the
// string the first arm returns)
declare function parse(input: unknown): string;
declare function parse(input: string): number[];
declare const s: string;
export const viaSubsumed = _at(_ref = parse(s)).call(_ref, 0);

// a provably non-matching literal first arm (different primitive family) still lets the
// second arm select precisely
declare function tag(x: 'a'): string;
declare function tag(x: number): number[];
export const viaLiteralReject = _includesMaybeArray(_ref2 = tag(5)).call(_ref2, 1);