// JSXMemberExpression `Foo.Bar` - should NOT polyfill Foo even when name matches global.
// Only children expressions should polyfill.
const a = <Promise.Bar val={Promise.resolve(1)} />;
const b = <Symbol.iterator>{Symbol.for("x")}</Symbol.iterator>;
