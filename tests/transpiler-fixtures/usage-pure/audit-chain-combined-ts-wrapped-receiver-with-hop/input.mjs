// TS-cast receiver kept verbatim composed with hop threading: the `(globalThis as any)` receiver
// stays raw in the memo (substituting through the cast would diverge from unplugin) while the
// `.map(...)` hop is still threaded onto the inner result
(globalThis as any).flat?.().map(x => x * 2).at?.(0);
