// `((cond ? Array : Iterator) as any)` - TS expression wrapper around a fallback.
// Per-branch destructure rewriting must peel both parenthesized and TS as-cast
// wrappers to reach the conditional underneath; the second statement covers the TS
// non-null assertion (!) variant
export const { from } = ((cond ? Array : Iterator) as any);
export const { values } = (Array || Set)!;
