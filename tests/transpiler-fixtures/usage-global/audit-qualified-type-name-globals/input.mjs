// a qualified TYPE name reaches a global only through its chain ROOT, and whether that root IS the
// realm is a scope question: a local binding named like a proxy owns the chain, so no segment of it
// names a global. the rule lives in the annotation walk alone - both legs route qualified names
// through it, and the identifier lane must not answer a second time off the bare member name
const self = { Reflect: 1 };
let overShadowedRealm: self.Reflect;

declare const NS: { Reflect: unknown };
let overNamespace: NS.Reflect;

let overRealm: globalThis.Set<number>;

let overMidChain: globalThis.Array.Map<string, number>;

export { self, overShadowedRealm, overNamespace, overRealm, overMidChain };
