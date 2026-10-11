// A store a pattern's init keeps holds a global behind nested effect sequences.
// The source stays as written, every effect included, and each method read off the stored global is injected.
let viaAssignment, kept, keptAssign;
export const { Array: { prototype: { at: viaDeclaration } } } = (kept = (first(), (second(), globalThis)));
({ Array: { prototype: { flat: viaAssignment } } } = (keptAssign = (third(), (fourth(), globalThis))));
export { kept, keptAssign, viaAssignment };
