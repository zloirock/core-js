// TS-cast bare proxy-global receiver composed with hop threading: `(globalThis as any)` is
// substituted to `_globalThis` (through the cast) while the surviving `.map(...)` hop is still
// threaded onto the inner result. both plugins resolve the receiver the same single way
(globalThis as any).flat?.().map(x => x * 2).at?.(0);
