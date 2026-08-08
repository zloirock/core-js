// destructuring with a computed key that SPELLS a well-known symbol as a string is a plain
// string-keyed extraction - no iterator-method substitution, no catch passthrough reservation;
// each host form (declarator / for-of / catch with rest) keeps its native shape
const arr = [1, 2];
export const { ['Symbol.iterator']: fromDeclarator } = arr;
export const out = [];
for (const { ['Symbol.iterator']: fromForOf } of [arr]) out[0] = fromForOf;
try {
  throw arr;
} catch ({ ['Symbol.asyncIterator']: fromCatch, ...rest }) {
  out[1] = fromCatch;
}
let fromAssignment;
({ ['Symbol.iterator']: fromAssignment } = arr);
let keyEffects = 0;
export const { [(keyEffects++, 'Symbol.iterator')]: fromSeKey } = arr;
