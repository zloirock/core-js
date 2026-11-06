// A decided conditional retains the chosen store and skips the other arm.
// Native literal-container reads consume the object actually stored.
var stash;
export const { C: { groupBy } } = typeof Symbol != 'undefined' ? (stash = { C: Map }) : { C: Object };
var held;
let from;
({ C: { from } } = typeof Symbol != 'undefined' ? (held = { C: Array }) : { C: Object });
export { stash, held, from };
