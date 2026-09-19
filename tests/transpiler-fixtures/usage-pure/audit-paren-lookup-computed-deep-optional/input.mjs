// computed key inside optional chain: `(arr?.[k].includes)(1)`. computed access goes
// through the same deopt path as identifier access. memoize the deep receiver so
// `arr[k]` evaluates once even with paren-lookup throw semantics
declare const arr: { [key: string]: number[] } | null;
declare const k: string;
const r = (arr?.[k].includes)(1);
