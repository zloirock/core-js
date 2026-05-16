// `(globalThis as any).flat?.(0);` - TS `as` cast around bare proxy-global Identifier.
// receiver source dispatch must peel TS_EXPR_WRAPPERS (alongside Paren / Chain) at the
// top of receiverObj so the direct-Identifier path resolves through the cast. parallel
// shape to the paren-wrapped bare case but with a different transparent-wrapper type.
(globalThis as any).flat?.(0);
