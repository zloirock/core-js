// `((cond ? Array : Iterator) as any)` - TS expression wrapper around a fallback.
// Per-branch destructure rewriting must peel both parenthesized and TS as-cast
// wrappers to reach the selection underneath. Under a TS non-null assertion (!) a `||`
// whose left always yields folds inside it (`Array!`), and one whose left the build
// does not serve mirrors its right arm through it
export const { from } = ((cond ? Array : Iterator) as any);
// @ts-expect-error a selection whose other arm lacks the member is the shape under test
export const { values } = (Array || Set)!;
// @ts-expect-error a selection whose other arm lacks the member is the shape under test
export const { isInteger } = (globalThis.WeakRef || Number)!;
