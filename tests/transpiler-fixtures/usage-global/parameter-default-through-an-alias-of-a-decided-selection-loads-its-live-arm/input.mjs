// A const alias of a selection the build decides holds its live operand, so a parameter default
// reading it loads that operand's static alone.
const decided = typeof Symbol != 'undefined' ? [Map] : [Object];
export function viaAlias([{ groupBy }] = decided) { return groupBy; }
