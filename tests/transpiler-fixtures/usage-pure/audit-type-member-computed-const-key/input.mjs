// a type-literal member keyed by a computed const names the folded key, so a receiver typed via it
// keeps the typed dispatch on that member. the key binding may carry the string as a value init, or
// - with no value - as a string-literal type (`declare const k: "cols"`), including a parenthesized
// one (`("flag")`) that one parser keeps wrapped: the fold must reach the inner literal on both.
// distinct method per line.
const arrKey = "rows";
declare const colKey: "cols";
declare const flagKey: ("flag");
type Grid = { [arrKey]: number[]; [colKey]: number[]; [flagKey]: number[][]; label: string; };
declare const g: Grid;
export const r1 = g.rows.at(0);
export const r2 = g.cols.includes(1);
export const r3 = g.flag.flat();
