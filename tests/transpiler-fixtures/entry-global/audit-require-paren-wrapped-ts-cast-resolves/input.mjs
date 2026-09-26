// `require(('core-js/...' as any))` - combined ParenthesizedExpression + TS cast around the
// string argument. shared adapter unwrap alternates paren / TS peel layers so the inner
// string literal still reaches the entry-detection check regardless of wrapper order
require(("core-js/actual/promise" as any));
