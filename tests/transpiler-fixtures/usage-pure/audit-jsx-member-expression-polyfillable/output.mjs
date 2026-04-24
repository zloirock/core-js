import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
// JSXMemberExpression `Foo.Bar` - should NOT polyfill Foo even when name matches global.
// Only children expressions should polyfill.
const a = <Promise.Bar val={_Promise$resolve(1)} />;
const b = <Symbol.iterator>{_Symbol$for("x")}</Symbol.iterator>;