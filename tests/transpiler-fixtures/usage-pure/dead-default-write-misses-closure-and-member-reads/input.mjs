// A default on a leaf pure serves as its ponyfill never runs: the import is never undefined, and the
// rewrite drops the default. A write in it reaches no read - not one in a function declared above it,
// not one off the member it writes.
let list = [1, 2];
const box = { items: [3, 4] };
export function last() { return list.at(-1); }
const { from = (list = 'ab', box.items = 'cd', 0) } = Array;
export const found = box.items.includes(3);
export const made = from([5]);
