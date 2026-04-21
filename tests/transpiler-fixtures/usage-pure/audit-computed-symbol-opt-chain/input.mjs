// resolveComputedSymbolKey: `obj?.[Symbol.iterator]` - OptionalMemberExpression wrap.
// resolveComputedSymbolKey checks `node.property` which is `Symbol.iterator` MemberExpression.
// should resolve to iterator polyfill
obj?.[Symbol.iterator]();
