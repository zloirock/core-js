// TS `as` cast around a bare proxy-global as the combined-chain method receiver:
// `(globalThis as any).flat?.().includes(1)`. the receiver is substituted through the cast to
// `_globalThis` (the same way the single-call path resolves it) - keeping it verbatim would
// strand a raw global after TS strip (ReferenceError on engines lacking globalThis). babel
// reuses the original receiver node in the memo so its inner proxy-global stays visitable;
// unplugin's combined-chain delegates to the canonical receiver resolver, which peels Paren /
// Chain / TS uniformly. both plugins substitute the receiver the same single way (no sidecar)
(globalThis as any).flat?.().includes(1);
