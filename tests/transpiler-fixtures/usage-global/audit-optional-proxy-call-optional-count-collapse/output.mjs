import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
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
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// The collapse-vs-rebind of an optional proxy chain rooted in a PURE call turns on the optional-hop COUNT,
// not just the first hop: EXACTLY ONE optional - the one on the call (`(call)?.self.Map.name`) - keeps the
// call in a null-guard and rebinds the tail off `_ref` (inner global rewritten to `_globalThis`). a SECOND
// optional anywhere - on a proxy hop (`(call)?.self?.Set.name`) or on the leaf (`(call)?.self.WeakMap?.name`)
// - makes the whole optional chain vestigially COLLAPSE to the always-defined polyfill, dropping the pure
// call. babel types every member of an optional chain OptionalMemberExpression, so the count keys on the `?.`
// FLAG, not the node type. distinct ctor per line.
const rebindSingleOpt = (() => globalThis)()?.self.Map.name;
const collapseHopOpt = (() => globalThis)()?.self?.Set.name;
const collapseLeafOpt = (() => globalThis)()?.self.WeakMap?.name;
export { rebindSingleOpt, collapseHopOpt, collapseLeafOpt };