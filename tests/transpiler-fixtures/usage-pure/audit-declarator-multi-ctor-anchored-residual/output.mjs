import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Set from "@core-js/pure/actual/set/constructor";
// a MULTI-ctor declarator whose residual leaves (`Set.union`, `Map.customZ`) must read off the
// pure CONSTRUCTOR binding (`{ union } = _Set`), not the native proxy (which throws off-engine and
// reads undefined); poly leaves still extract via their own imports. re-anchoring fires only in
// the CLEAN case (every prop consumed-or-anchored, SE-free init, a CONSUMED sibling); else native
const from = _Array$from;
const {
  union
} = _Set;
const fromEntries = _Object$fromEntries;
const groupBy = _Map$groupBy;
const {
  customZ
} = _Map; // all-anchored, no consuming sibling: stays native (bail)
const {
  Set: {
    intersection
  },
  WeakSet: {
    customW
  }
} = _globalThis;
export const out = [from, union, fromEntries, groupBy, customZ, intersection, customW];