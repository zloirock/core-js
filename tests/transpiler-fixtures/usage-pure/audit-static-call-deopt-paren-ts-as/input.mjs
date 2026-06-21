// `(Array as any)?.from(...)` - the TS wrapper strip walks the parent chain through
// TSAsExpression + ParenthesizedExpression, then the optional-call deopt overrides the
// emit slot at callee level. lock the composite: TS strip + paren peel + `?.` deopt all
// converging. uses Array.from AND Promise.resolve to prove it composes for distinct statics.
const xs = (Array as any)?.from([1, 2, 3]);
const p = (Promise as any)?.resolve('ok');
xs;
p;
