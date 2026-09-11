import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Set from "@core-js/pure/actual/set/constructor";
// the ASSIGNMENT-cascade twin of the declarator anchored-residual: a multi-ctor destructure on an
// AssignmentExpression host (`({ Array: { from }, Set: { union } } = globalThis)`) whose residual
// leaves off a MISSING-ABLE ctor (`Set.union`, `Map.customZ`) must read off the pure CONSTRUCTOR
// binding (`({ union } = _Set)`), not the native proxy (which throws off-engine / reads undefined).
// re-anchoring fires only when a sibling leaf is CONSUMED (SE-free, all-props consumed-or-anchored);
// an all-anchored line with no consumed sibling bails and stays on the substituted global proxy
let from, union, fromEntries, groupBy, customZ, intersection, customW;
from = _Array$from;
({
  union
} = _Set);
fromEntries = _Object$fromEntries;
groupBy = _Map$groupBy;
({
  customZ
} = _Map);
({
  Set: {
    intersection
  },
  WeakSet: {
    customW
  }
} = _globalThis);
export const out = [from, union, fromEntries, groupBy, customZ, intersection, customW];