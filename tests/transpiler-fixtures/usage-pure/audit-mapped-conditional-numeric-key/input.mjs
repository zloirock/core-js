// mapped-type rename with conditional `K extends string` discriminates by literal kind:
// numeric-literal keys (0, 1) yield false (TS spec: `0 extends string` = false), so they
// take the false-branch. without literal-kind discrimination, plugin would mis-pick
// the true-branch and over-narrow numeric-keyed members
type StringOnly<T> = { [K in keyof T as K extends string ? K : never]: T[K] };
declare const r: StringOnly<{ items: string[]; 0: number }>;
r.items.at(0);
