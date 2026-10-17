// ... a CATCH parameter binds like a declarator, so the climb has to stop AT it instead of walking
// past into the enclosing function's params - and where its RELOCATION reaches the claim, the fold
// takes over from the mirror: one read of the hop, both arms through the guard, where mirroring the
// default alone left the live arm raw
export const c4 = (() => { try { throw {}; } catch ({ inner: { from } = Array }) { return typeof from; } })();
export const r = [c4];
