// element-type precision holds only while nothing can retype the elements between the
// array's creation and the read: an element write flips the family at runtime, so the
// read bails to the generic helper instead of keying a wrong-family Maybe (ie:11)
const written = [1, 2];
written[0] = 'x';
export const viaElementWrite = written[0].at(0);

// a read-only-referenced literal keeps its per-element precision
const sealed = [[1], [2]];
export const viaSealedRead = sealed[0].includes(1);
