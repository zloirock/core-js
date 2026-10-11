// an `&&` yields its left only where that is falsy, which no constructor and no object literal ever is: a
// selection over it reads the statics of what the `&&` hands on and of the other arm, never the left's
export const { C: { groupBy } } = ({ C: Object } && u) || { C: Map };
export const from = ((Array && u) || Iterator).from;
export const { Promise: { isInteger } } = ({ Promise: Number } && u) || globalThis;
