// `(T)[keyof T]` with a parenthesized object operand: the keyof-self value-union resolver must peel
// the TSParenthesizedType wrapper before matching the keyof target, else it bails and `.at` loses the
// array narrow. all of T's property value types are `number[]`, so the union folds to the array variant
type T = { a: number[]; b: number[] };
declare const obj: (T)[keyof T];
obj.at(0);
