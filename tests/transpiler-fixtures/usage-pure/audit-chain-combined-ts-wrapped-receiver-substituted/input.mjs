// TS `as` cast around a bare proxy-global as the combined-chain method receiver:
// `(globalThis as any).flat?.().includes(1)`. the receiver is substituted THROUGH the cast to
// `_globalThis` - keeping it verbatim would strand a raw global after TS strip (ReferenceError
// on engines lacking globalThis). both plugins peel Paren / Chain / TS and substitute it the same way
(globalThis as any).flat?.().includes(1);
