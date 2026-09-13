// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
({ Symbol, Array: { from }, ...rest } = globalThis);
export const viaShorthandRest = [from([1]), rest];

let al;
({ Iterator: al, ...others } = globalThis);
export const viaAliasedRest = [al.range(0, 3), others];
