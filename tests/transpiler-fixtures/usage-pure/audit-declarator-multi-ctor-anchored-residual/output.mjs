import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Set from "@core-js/pure/actual/set/constructor";
// a MULTI-ctor declarator whose residual leaves (`Set.customQ`, `Map.customZ`) must read off the
// pure CONSTRUCTOR binding (`{ customQ } = _Set`), not the native proxy (which throws off-engine and
// reads undefined); poly leaves still extract via their own imports. re-anchoring fires only in
// the CLEAN case (every prop consumed-or-anchored, SE-free init, a CONSUMED sibling); else native
// the residual keys here are ones NEITHER surface carries: a key core-js spells as a PROTOTYPE
// entry of that constructor (`Set.union`) is handed out as a static by the pure binding and by
// nothing else, so such a leaf declines the anchor and would measure that rule instead of this one
const from = _Array$from;
const {
  customQ
} = _Set;
const fromEntries = _Object$fromEntries;
const groupBy = _Map$groupBy;
const {
  customZ
} = _Map; // all-anchored, no consuming sibling: stays native (bail)
const {
  Set: {
    customR
  },
  WeakSet: {
    customW
  }
} = _globalThis;
export const out = [from, customQ, fromEntries, groupBy, customZ, customR, customW];