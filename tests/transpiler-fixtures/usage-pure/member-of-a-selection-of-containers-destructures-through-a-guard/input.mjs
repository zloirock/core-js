// a destructure reading a static off a member of a selection of containers reads one arm's constructor
// per pass, so the static takes the identity guard its member spelling takes, over a receiver read once:
// flat off a held selection or one spelled in place, as an assignment, into a pattern, and nested off a
// held selection
const box = flag ? { C: Map } : { C: Object };
export const { groupBy } = box.C;
export const { from } = (flag ? { C: Iterator } : { C: Array }).C;
let isInteger;
export const assign = () => ({ isInteger } = (flag ? { C: Number } : { C: Promise }).C);
const shelf = flag ? { C: Object } : { C: Set };
export const { C: { fromEntries } } = shelf;
const desk = flag ? { C: Promise } : { C: Object };
export const { assign: { length: arity } } = desk.C;
