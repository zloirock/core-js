// A store a pattern's init keeps holds a global under a type cast, behind an effect.
// The cast leaves with the global it wraps, as wherever a bare global is swapped.
let kept: any;
export const { Array: { prototype: { findLast: viaDeclaration } } } = (kept = (first(), globalThis as any));
export { kept };
