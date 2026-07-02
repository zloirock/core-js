// A proxy-global root navigating a NON-pure leaf (the `Array` constructor / `Array.isArray`, neither
// pure-substituted) through redundant proxy hops must COLLAPSE the hops to the substituted root:
// substituting only the identifier leaves `_globalThis.self.Array`, reading an undefined `.self` /
// `.window` hop off the global on hosts without it (ie:11 / Node). every hop shape collapses to
// `_globalThis.<leaf>`: dotted, const-alias computed (binding-aware key), multi-hop, and a plain
// destructure DEFAULT value. a bare root (`globalThis.Array`, no hop) is the no-over-collapse control.
const aliasKey = "self";
const named = new globalThis.self.Array(3);
const computedAlias = new globalThis[aliasKey].Array(3);
const multiHop = new globalThis.self.window.Array(3);
const staticOffHop = globalThis.self.Array.isArray([1]);
const { defaulted = globalThis.self.Array } = {};
const bareRoot = new globalThis.Array(3);
export { named, computedAlias, multiHop, staticOffHop, defaulted, bareRoot };
