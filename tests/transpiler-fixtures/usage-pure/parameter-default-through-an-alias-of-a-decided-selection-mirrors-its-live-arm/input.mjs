// A const alias of a selection the build decides holds its live operand, so a parameter default
// reading it mirrors that operand like the plain alias does.
const decided = typeof Symbol != 'undefined' ? [Map] : [Object];
export function viaAlias([{ groupBy }] = decided) { return groupBy; }
