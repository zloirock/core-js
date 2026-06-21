import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Set from "@core-js/pure/actual/set/constructor";
// a MULTI-ctor declarator: a missing-able ctor's residual leaves (`Set.union`, `Map.customZ`) read off the
// pure CONSTRUCTOR binding (`{ union } = _Set`), generalizing the single-ctor anchor per prop. reading them
// off the native proxy (`_globalThis.Set.union`) throws off-engine and reads native undefined. poly leaves
// still extract via their dedicated imports. re-anchoring fires only in the CLEAN case (every prop consumed-
// or-anchored, SE-free init, AND a CONSUMED sibling - babel's flatten dispatch is usage-driven, so an all-
// anchored pattern with no poly/alias leaf would not trigger it). a verbatim sibling / SE / disabled / rest /
// all-anchored form stays on the native residual
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