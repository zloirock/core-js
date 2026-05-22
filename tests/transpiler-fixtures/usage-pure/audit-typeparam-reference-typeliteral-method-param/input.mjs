// generic outer fn returning a TSTypeLiteral with a method member whose param references
// outer T (`{ foo(m: Map<T, string>): string[] }`). reference-detection must traverse
// TSMethodSignature params inside TSTypeLiteral members, otherwise outer-fn subst stops at
// the type-literal boundary and the inner method signature is never visited for T-uses
function wrap<T>(x: T): { foo(m: Map<T, string>): string[] } { return null as any; }
const obj = wrap('a');
const result = obj.foo(new Map());
result.at(0);
