// `infer U extends Constraint` (TS 4.7+) attaches a constraint to the inferred placeholder;
// the selected element type determines its receiver family
type FirstNumber<T> = T extends [infer U extends number, ...any[]] ? U : never;
declare const f: FirstNumber<[number, string]>;
const arr: number[] = [];
arr.includes(f);
type FirstText<T> = T extends [infer U extends string, ...unknown[]] ? U : never;
declare const word: FirstText<['word', number]>;
word.at(0);
