// the write CHANNELS that make typing treat a namespace as patched. each row patches a DIFFERENT
// namespace so the rows stay attributable: an alias of the namespace, a write through the global
// object, and one through the LOWERED shape a bundler leaves behind (a proxy entry required rather
// than imported - the global object itself). all leave the patched static's result unknown, so the
// receiver keeps the typeless row
var aliased = Object;
aliased.create = replacement;
var fromPatchedCreate = Object.create(Array.prototype);
export const a = fromPatchedCreate.at(0);
globalThis.Array.from = replacement;
export const b = Array.from([1]).includes(2);
var lowered = require("core-js/actual/global-this");
lowered.Map.groupBy = replacement;
export const c = Map.groupBy([1], f).flatMap(g);
