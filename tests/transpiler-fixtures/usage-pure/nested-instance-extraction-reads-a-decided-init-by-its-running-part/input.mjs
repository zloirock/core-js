// a nested instance read extracts off a slot whose value runs code where the init's running part performs
// nothing else, as that init spelled without what the build decides: a call or a construction in a decided
// container's slot, an effect ahead of the decided arm, a fresh-object `||` left, a quiet comma and a store
// in a decided slot. a sibling slot whose live arm runs an effect keeps the read native
export const { C: { at } } = typeof Symbol != 'undefined' ? { C: getArr() } : { C: user };
export const { D: { toReversed } } = typeof Symbol != 'undefined' ? { D: new Array(2) } : { D: user };
export const { E: { findLast } } = typeof Symbol != 'undefined' ? (mark(), { E: [] }) : { E: user };
export const { F: { flat } } = (mark(), { F: [] }) || { F: user };
export const { G: { includes } } = (0, { G: getArr() });
var B;
export const { W: { toSorted } } = { W: typeof Symbol != 'undefined' ? (B = []) : user };
export { B };
export const { H: { with: replaced } } = { H: getArr(), I: typeof Symbol != 'undefined' ? mark() : 0 };
