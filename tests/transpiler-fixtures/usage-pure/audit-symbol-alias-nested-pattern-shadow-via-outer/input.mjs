// the same-name INNER shadow off a user object still reads the user value while the outer
// same-file alias keeps its fold - the sibling records disambiguate positionally
const { iterator: outerIt } = Symbol;
export const viaOuter = typeof [][outerIt];
