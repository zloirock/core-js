// `class C extends ((globalThis as any).Array)<string[]> {}` - outer paren wraps a TS-cast
// MemberExpression. the peel strips both ParenthesizedExpression and TSAsExpression so inner
// `globalThis.Array` reaches global-member lookup and narrows the chain. oxc keeps the outer
// paren in codegen while babel strips it - same import, codegen-only `output-unplugin.mjs` diff
class C extends ((globalThis as any).Array)<string[]> {}
const c = new C();
c.includes('x');
