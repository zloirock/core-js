import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// `class C extends ((globalThis as any).Array)<string[]> {}` - outer paren wraps a
// TS-cast MemberExpression. `resolveSuperGlobalName`'s `unwrapRuntimeExpr` peels both
// `ParenthesizedExpression` and `TSAsExpression` so the inner `globalThis.Array` reaches
// `globalProxyMemberName` and narrows the chain. oxc preserves the outer paren in the
// emitted code while babel strips it; both adapters emit the same instance polyfill
// import - the divergence is codegen-only, captured by `output-unplugin.mjs`
class C extends _globalThis.Array<string[]> {}
const c = new C();
_includesMaybeArray(c).call(c, 'x');