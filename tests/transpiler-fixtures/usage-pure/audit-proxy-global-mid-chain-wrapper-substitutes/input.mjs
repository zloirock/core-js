// Proxy-global chain with mid-chain wrapper: `(globalThis?.X).Y.at?.(0)`. usage-pure
// must substitute the `globalThis` leaf with the polyfilled binding so the call site
// doesn't reference the raw global (engines without `globalThis` ReferenceError on it).
// without descending past the paren wrap mid-chain, the chain-substituter bails and
// emits raw `globalThis?.X` verbatim in the receiver slot.
(globalThis?.X).Y.at?.(0);
