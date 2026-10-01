// `&&` control: a nullish left short-circuits to a nullish RESULT, which throws the same
// TypeError transformed or not, so the fold to the RIGHT operand survives the nullish-strip
// marker - only the string shape injects (es.string.at, no es.array.at)
declare const r: number[] | null;
(r && 'tail').at(1);
