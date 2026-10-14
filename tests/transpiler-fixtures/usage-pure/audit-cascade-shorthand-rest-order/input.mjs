// An assignment pattern over the realm beside an object rest: the residual keeps the rest and its
// exclusions, and the claimed static nested under it is written after the residual. A global copied
// back into its own slot (`Symbol`) takes its whole entry there, first; a constructor bound beside the
// rest takes its ponyfill, and a static read later off that binding takes the static's own entry.
({ Symbol, Array: { from }, ...rest } = globalThis);
export const viaShorthandRest = [from([1]), rest];

let al;
({ Iterator: al, ...others } = globalThis);
export const viaAliasedRest = [al.from([0]), others];
