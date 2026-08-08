import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// a nullish-capable LEFT of `&&` makes the right-fold survivor itself nullish-capable
// (`r && arr` is null when r is null), so the enclosing `||` may yield its string operand
// at runtime - the union must keep generic dispatch instead of an array-specific Maybe
// that throws on the string (ie:11)
declare const r: number[] | null;
declare const arr: number[];
declare const s: string;
export const viaAndOr = _at(_ref = r && arr || s).call(_ref, 1);

// the bare `&&` fold keeps the Array narrow: the only non-array runtime value is nullish,
// which throws identically transformed or not (throw parity)
export const viaBareAnd = _includesMaybeArray(_ref2 = r && arr).call(_ref2, 2);