// Same mid-chain lift as `audit-static-walk-proxy-global-mid-chain` but through `self`
// instead of `globalThis`. Verifies `proxyGlobalNameOf` handles every `POSSIBLE_GLOBAL_OBJECTS`
// member (globalThis / self / window / globalLexicalScope) symmetrically. Without parity
// across the set, `globalThis` would polyfill while `self`/`window` would silently miss
const ns = { root: self };
const { root: { Map: { groupBy } } } = ns;
export const grouped = groupBy([1, 2, 3], n => n % 2);
