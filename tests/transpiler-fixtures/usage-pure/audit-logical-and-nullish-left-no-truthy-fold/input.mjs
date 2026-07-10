// a nullish-capable LEFT of `&&` makes the right-fold survivor itself nullish-capable
// (`r && arr` is null when r is null), so the enclosing `||` may yield its string operand
// at runtime - the union must keep generic dispatch instead of an array-specific Maybe
// that throws on the string (ie:11)
declare const r: number[] | null;
declare const arr: number[];
declare const s: string;
export const viaAndOr = (r && arr || s).at(1);

// the bare `&&` fold keeps the Array narrow: the only non-array runtime value is nullish,
// which throws identically transformed or not (throw parity)
export const viaBareAnd = (r && arr).includes(2);
