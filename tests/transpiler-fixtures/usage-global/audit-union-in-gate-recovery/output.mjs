import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the `in` producer used to fence its reachable union behind a RESOLVABLE dominating pair (a
// static dominating receiver AND a folding dominating key); a reachable reassignment alternative
// now enumerates regardless - the uninjectable primary rides an inert carrier meta. one axis
// recovered per line, then both at once; distinct methods attribute a regressed form. the
// exhaustively-enumerated receivers here are provably instance-free, so the constant-key
// probes inject ONLY their reachable static rows - no fabricated instance variants
let O = {};
if (globalThis.cond) O = Array;
export const viaReceiver = 'from' in O;
let K = globalThis.dyn;
if (globalThis.cond) K = 'of';
export const viaKey = K in Array;
let O2 = {};
let K2 = globalThis.dyn;
if (globalThis.cond) {
  O2 = Map;
  K2 = 'groupBy';
}
export const viaBoth = K2 in O2;
// a logical-assign reassignment flows its RHS as a POSSIBLE receiver value too
let O3 = null;
O3 ||= Object;
export const viaLogicalAssign = 'entries' in O3;