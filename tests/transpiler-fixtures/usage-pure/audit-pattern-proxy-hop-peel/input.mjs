// a destructure pattern hop that is itself a proxy-global alias binds nothing: it peels like
// the member-chain prefix walk (`globalThis.self.x` -> `_globalThis.x`), anchoring the remaining
// pattern on the receiver's own always-defined binding - a leaf-less residual left verbatim
// reads the raw hop off the pure root (undefined off-engine -> destructure TypeError). deeper
// hops peel iteratively; a namespace below the hop anchors as the member read; a hop default is
// dead under the collapse contract (the hop is always defined post-rewrite) and drops with the
// hop. a REST below the hop keeps the raw residual (rest gathers the hop's other keys); a
// slot-mutated hop keeps the raw residual (the user patch must stay visible).
let a1, a2, a3, a4, a5;
({ self: { a1 } } = globalThis);
({ self: { window: { a2 } } } = globalThis);
({ self: { Math: { PI: a3 } } } = globalThis);
({ ['self']: { a4 } } = globalThis);
({ self: { a5 } = {} } = globalThis);
let out;
for (const { self: { keys } } = globalThis; !out;) out = typeof keys;
let rest;
({ self: { ...rest } } = globalThis);
export { a1, a2, a3, a4, a5, out, rest };
