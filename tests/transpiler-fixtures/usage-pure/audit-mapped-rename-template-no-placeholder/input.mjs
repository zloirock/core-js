// matchTemplatePattern with a TSTemplateLiteralType that has no expressions (only a
// single fixed-string quasi `\`abc\``) is equivalent to the literal `'abc'`. without
// the early no-placeholder guard the template engine would still treat the quasi as
// a prefix and silently match `abcdef` - the Filter would erroneously include the
// string[] member, so `.includes('a')` would emit the array-flavored polyfill on a
// string. with the guard, only the exact `abc` member survives the rename and the
// abcdef-keyed `.includes('a')` falls back to the generic `_includes` polyfill
type Filter<T> = { [K in keyof T as K extends `abc` ? K : never]: T[K] };
declare const r: Filter<{ abc: number[]; abcdef: string[] }>;
r.abc.at(0);
r.abcdef.includes('a');
