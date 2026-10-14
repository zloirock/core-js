// A default on a leaf pure serves as its ponyfill never runs, and the rewrite drops it before a later
// read is asked about: a write in it reaches none - not one after the declaration, not one after the
// function the default sits in.
let list = [1, 2];
const { from = (list = 'ab', 0) } = Array;
export const last = list.at(-1);
let rows = [3, 4];
(() => { const { of = (rows = 'cd', 0) } = Array; return of; })();
export const found = rows.includes(3);
export const made = from([5]);
