// const g = globalThis; class C extends g.Array<string[]> {}; new C().at(0)
// `resolveSuperGlobalName` -> `globalProxyMemberName` -> `isProxyGlobalIdentifierNode`
// must follow the const alias chain for the receiver Identifier `g`. `resolveRuntimeExpression`
// walks `g` -> `globalThis` so the base reaches the proxy-global recognizer and the
// instance method dispatch narrows `c.at(0)` to `_atMaybeArray`
const g = globalThis;
class C extends g.Array<string[]> {}
const c = new C();
c.at(0);
