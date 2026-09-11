// a binding that MAY be a constructor takes the identity guard, and a pattern reading several of its
// statics splits into one read per prop, in source order - each with its own guard. the split needs
// every prop answered HERE: a prop left for the claim funnel would depend on a later visit, and only
// one leg re-visits what it splices
let M = globalThis.Array;
if (!M) M = Array;
const { from, of } = M;
// ... the claim's own position in the pattern decides nothing - the reads keep source order
const { of: of2, from: from2 } = M;
// NEGATIVE: one prop this plan cannot answer (a plain data key) keeps the whole pattern - splitting
// it would hand that prop to a pass one leg makes and the other does not
const { from: from3, of: of3, isArray } = M;
// a REST gathers what no read names, so it cannot become a read of its own - it stays BEHIND them,
// reading the same receiver with the consumed key renamed to a sentinel
const { from: from4, ...rest } = M;
// NEGATIVE: a DEFAULT belongs to its own canon, a COMPUTED key would be printed twice
const { from: from5, of: of5 = 1 } = M;
const dyn = 'of';
const { from: from6, [dyn]: of6 } = M;
// the ASSIGNMENT host splits too, where its value is nobody's - a statement of its own
let a, b;
({ from: a, of: b } = M);
export { from, of, of2, from2, from3, of3, isArray, from4, rest, from5, of5, from6, of6, a, b };
