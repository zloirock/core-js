// a SHADOWING inner binding's mutator does not poison the outer binding - references are
// scope-discriminated
const shaded = [[1], [2]];
{ const shaded = [9]; shaded.fill(0); }
export const viaShadowedMutator = shaded[0].at(7);
