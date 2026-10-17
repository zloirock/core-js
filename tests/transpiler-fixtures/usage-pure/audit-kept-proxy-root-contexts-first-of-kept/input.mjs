// The kept double-optional through each remaining host: an ARRAY pattern source (never deferred),
// a for-of head, and an IIFE synth argument (the swap still owns the receiver over the narrowed
// defer). One memo at the root in the first two; the synth renders its own harvest in the third.
let c2 = 0;
let ap;
export const [firstOfKept] = ((ap = globalThis.window)?.[(c2++, 'self')].Array.of(1, 2)) ?? [];
export { c2 };
