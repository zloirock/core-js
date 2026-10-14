// A rest sibling keeps the pattern native around a leaf pure serves as its ponyfill, and the leaf's
// default leaves with the rewrite all the same: a write in it reaches no later read, through a
// declaration and through an assignment alike.
let list = [1, 2];
const { from = (list = 'ab', 0), ...rest } = Array;
export const last = list.at(-1);
let rows = [3, 4], of, others;
({ of = (rows = 'cd', 0), ...others } = Array);
export const found = rows.includes(3);
export const made = [from([5]), rest, of(6), others];
