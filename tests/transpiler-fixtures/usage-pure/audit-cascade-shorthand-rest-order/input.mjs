// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
({ Symbol, Array: { from }, ...rest } = globalThis);
export const viaShorthandRest = [from([1]), rest];

let al;
({ Iterator: al, ...others } = globalThis);
export const viaAliasedRest = [al.range(0, 3), others];
