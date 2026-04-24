import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// conditional type using `infer` to extract an array element type. plugin recognises the
// `T extends (infer U)[] ? U : never` pattern and resolves `Inner<string[]>` to `string`,
// so `u.includes('a')` dispatches the String-specific polyfill
type Inner<T> = T extends (infer U)[] ? U : never;
declare const u: Inner<string[]>;
_includesMaybeString(u).call(u, 'a');