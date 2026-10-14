// A default on a static the build does not serve - an excluded entry, a key core-js has no ponyfill
// for - stays where the source put it and runs where the slot is missing, so a write in it still
// reaches a later read.
let list = [1, 2];
const { from = (list = 'ab', 0) } = Array;
export const last = list.at(-1);
let rows = [3, 4];
const { foo = (rows = 'cd', 0) } = Array;
export const found = rows.includes(3);
export const made = [from, foo];
