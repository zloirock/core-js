import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
// A SE-bearing computed proxy hop on a constructor-mutation LHS (`globalThis[(e++, 'self')].Set = ...`)
// collapses the redundant `.self` hop to the pure global, harvesting the key effect ONCE. it must never
// strand a dead `_globalThis` import nor re-root a proxy chain that re-triggers the rewrite (an infinite
// replace loop - a regression the receiver collapse must bail BEFORE injecting the root to avoid). the
// trailing `new Set()` consumes the global-object import - the SE-folded hop mutation records the
// canonical `globalThis.Set` slot, so the bare constructor read follows the replaced slot.
let e = 0;
(e++, _self).Set = function () {};
const s = new (_globalThis.Set === undefined ? _Set : _globalThis.Set)([1]);
export { s };