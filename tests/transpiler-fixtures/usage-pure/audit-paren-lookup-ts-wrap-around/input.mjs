// `((arr?.at) as any)(0)` wraps an optional member in parens + TS cast then makes a
// NON-optional outer call. polyfill must preserve native semantics: nullish throws,
// success keeps `this=arr` through the paren-wrapped Reference Type
const a = ((arr?.at) as any)(0);
const b = ((arr?.flat) as any)();
