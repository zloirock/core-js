// A store a pattern's init keeps holds a global under a type cast, behind an effect.
// The source keeps the cast and the effect, and the method read off the stored global is injected.
let kept: any;
export const { Array: { prototype: { findLast: viaDeclaration } } } = (kept = (first(), globalThis as any));
export { kept };
