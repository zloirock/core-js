import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
// Same mid-chain lift as `audit-static-walk-proxy-global-mid-chain` but through `self`
// instead of `globalThis`. Verifies every global-object proxy member (globalThis / self /
// window / global lexical scope) is recognized symmetrically. Without parity across the
// set, `globalThis` would polyfill while `self` / `window` would silently miss.
const ns = {
  root: _self
};
const groupBy = _Map$groupBy;
export const grouped = groupBy([1, 2, 3], n => n % 2);