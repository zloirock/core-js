import _globalThis from "@core-js/pure/actual/global-this";
// A proxy-global root navigating a NON-pure leaf (the `Array` constructor / `Array.isArray`, neither
// pure-substituted) through redundant proxy hops must COLLAPSE the hops to the substituted root:
// substituting only the identifier leaves `_globalThis.self.Array`, reading an undefined `.self` /
// `.window` hop off the global on hosts without it (ie:11 / Node). every hop shape collapses to
// `_globalThis.<leaf>`: dotted, const-alias computed (binding-aware key), multi-hop, and a plain
// destructure DEFAULT value. a bare root (`globalThis.Array`, no hop) is the no-over-collapse control.
const aliasKey = "self";
const named = new _globalThis.Array(3);
const computedAlias = new _globalThis.Array(3);
const multiHop = new _globalThis.Array(3);
const staticOffHop = _globalThis.Array.isArray([1]);
const {
  defaulted = _globalThis.Array
} = {};
const bareRoot = new _globalThis.Array(3);
export { named, computedAlias, multiHop, staticOffHop, defaulted, bareRoot };