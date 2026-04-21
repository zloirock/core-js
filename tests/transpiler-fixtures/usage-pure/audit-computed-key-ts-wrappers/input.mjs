// buildMemberMeta unwraps TS/ParenthesizedExpression on computed keys via unwrapParens.
// `Symbol[(k) as any]` resolves through TSAsExpression wrapper; `Symbol[k!]` through
// TSNonNullExpression. Both must still resolve `k` to its bound string literal 'iterator'
const k = 'iterator';
Symbol[(k) as any] in obj;
Symbol[k!] in obj;
