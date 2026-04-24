// conditional type using `infer` to extract an array element type. plugin recognises the
// `T extends (infer U)[] ? U : never` pattern and resolves `Inner<string[]>` to `string`,
// so `u.includes('a')` dispatches the String-specific polyfill
type Inner<T> = T extends (infer U)[] ? U : never;
declare const u: Inner<string[]>;
u.includes('a');
