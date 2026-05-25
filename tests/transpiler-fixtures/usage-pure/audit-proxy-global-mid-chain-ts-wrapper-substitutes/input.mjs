// proxy-global chain through a TS `as` mid-chain wrapper. resolveProxyGlobalChainSrc must
// peel TS expression wrappers between hops to reach the `globalThis` leaf for substitution;
// otherwise the receiver retains raw `globalThis` and IE11 ReferenceErrors on the
// implicit lookup before the polyfill ever fires.
((globalThis as any).X).Y.at?.(0);
