// A SE-bearing computed proxy hop on a constructor-mutation LHS (`globalThis[(e++, 'self')].Set = ...`)
// collapses the redundant `.self` hop to the pure global, harvesting the key effect ONCE. it must never
// strand a dead `_globalThis` import nor re-root a proxy chain that re-triggers the rewrite (an infinite
// replace loop - a regression the receiver collapse must bail BEFORE injecting the root to avoid). the
// trailing `new Set()` consumes the constructor import - a proxy-global-chain mutation is out of the
// mutation pre-pass scope, so the bare constructor still substitutes the pure import.
let e = 0;
globalThis[(e++, 'self')].Set = function () {};
const s = new Set([1]);
export { s };
