// a declaration the extraction splits into several statements keeps its leading comment on the
// FIRST of them, whichever host decides the split - a plain one, an exported one, a
// multi-declarator one. a comment after the declaration is a trailing one and stays there
const { of, from } = Array;
/** exported host */
export const { keys } = Object;
/* multi-declarator host */
const { fromEntries } = Object, other = 1;
const { values } = Object; // trailing, not leading
console.log(of, from, fromEntries, other, values);
