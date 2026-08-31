import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a qualified TYPE name reaches a global only through its chain ROOT, and whether that root IS the
// realm is a scope question: a local binding named like a proxy owns the chain, so no segment of it
// names a global. the rule lives in the annotation walk alone - both legs route qualified names
// through it, and the identifier lane must not answer a second time off the bare member name
const self = {
  Reflect: 1
};
let overShadowedRealm: self.Reflect;
declare const NS: {
  Reflect: unknown;
};
let overNamespace: NS.Reflect;
let overRealm: globalThis.Set<number>;
let overMidChain: globalThis.Array.Map<string, number>;
export { self, overShadowedRealm, overNamespace, overRealm, overMidChain };