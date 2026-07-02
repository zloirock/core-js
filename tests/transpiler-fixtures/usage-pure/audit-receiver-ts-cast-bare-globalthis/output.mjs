import _globalThis from "@core-js/pure/actual/global-this";
// `(globalThis as any).flat?.(0);` - TS `as` cast around bare proxy-global Identifier.
// receiver source dispatch must peel TS expression wrappers (alongside Paren / Chain) at the
// top of receiverObj so the direct-Identifier path resolves through the cast. parallel
// shape to the paren-wrapped bare case but with a different transparent-wrapper type.
_globalThis.flat?.(0);