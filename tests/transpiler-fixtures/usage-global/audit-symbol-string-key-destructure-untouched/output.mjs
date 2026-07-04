// destructuring with a computed key that SPELLS a well-known symbol as a string is a plain
// string-keyed extraction - nothing to polyfill, so no symbol/iterator modules are injected
// (a real `[Symbol.iterator]` key here would pull the whole iterator suite); for-of is kept
// out of this fixture since its own iteration protocol injects the same modules legitimately
const arr = [1, 2];
export const {
  ['Symbol.iterator']: fromDeclarator
} = arr;
let fromAssignment;
({
  ['Symbol.iterator']: fromAssignment
} = arr);
export let fromCatch;
try {
  throw arr;
} catch ({
  ['Symbol.asyncIterator']: caught,
  ...rest
}) {
  fromCatch = caught;
}