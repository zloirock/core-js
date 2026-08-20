import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// `class C extends ((globalThis as any).Array)<string[]> {}` - outer paren wraps a TS-cast
// MemberExpression. the peel strips both ParenthesizedExpression and TSAsExpression so inner
// `globalThis.Array` reaches global-member lookup and narrows the chain. oxc keeps the outer
// paren in codegen while babel strips it - same import, codegen-only `output-unplugin.mjs` diff
class C extends (_globalThis.Array)<string[]> {}
const c = new C();
_includesMaybeArray(c).call(c, 'x');