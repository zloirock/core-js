import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// for-in / for-of head bound to a bare global identifier is a write target: in pure mode the
// global must NOT be rewritten to a frozen `@core-js/pure` import, since reassigning that const
// binding in the loop head would TypeError. both plugins leave it bare. an ordinary read of a
// global (WeakMap) is still polyfilled - the guard is scoped to the head LHS. distinct globals
for (Map of []) {}
for (Set in {}) {}
new _WeakMap();