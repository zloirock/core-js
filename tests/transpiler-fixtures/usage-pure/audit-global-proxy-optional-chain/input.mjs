// optional-chain on global proxy: globalThis?.Map should resolve same as globalThis.Map.
// babel emits OptionalMemberExpression; oxc emits ChainExpression wrapping MemberExpression
const x = globalThis?.Set.prototype;
const y = globalThis?.Map.prototype;
x;
y;
