// `((cond ? Array : Iterator) as any)` - TS expression wrapper around a fallback.
// Per-branch destructure rewriting must peel both parenthesized and TS as-cast
// wrappers to reach the selection underneath. Under a TS non-null assertion (!) a `||`
// whose left always yields folds inside it (`Array!`), and one whose left the build
// does not serve mirrors its right arm through it
export const { from } = ((cond ? Array : Iterator) as any);
export const { values } = (Array || Set)!;
export const { isInteger } = (globalThis.WeakRef || Number)!;
