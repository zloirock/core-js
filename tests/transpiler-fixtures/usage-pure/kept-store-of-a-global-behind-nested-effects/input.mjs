// A store a pattern's init keeps holds a global behind nested effect sequences.
// The global is swapped where it stands in the innermost sequence, so every effect still runs, in order.
let viaAssignment, kept, keptAssign;
export const { Array: { prototype: { at: viaDeclaration } } } = (kept = (first(), (second(), globalThis)));
({ Array: { prototype: { flat: viaAssignment } } } = (keptAssign = (third(), (fourth(), globalThis))));
export { kept, keptAssign, viaAssignment };
