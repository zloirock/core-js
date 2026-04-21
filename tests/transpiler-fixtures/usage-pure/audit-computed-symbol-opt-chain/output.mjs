import _getIterator from "@core-js/pure/actual/get-iterator";
// resolveComputedSymbolKey: `obj?.[Symbol.iterator]` - OptionalMemberExpression wrap.
// resolveComputedSymbolKey checks `node.property` which is `Symbol.iterator` MemberExpression.
// should resolve to iterator polyfill
obj == null ? void 0 : _getIterator(obj);