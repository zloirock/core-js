// An effectful computed key beside a leaf pure serves as its ponyfill splits the pattern around the key, and
// the leaf's default leaves with the rewrite all the same: a write in it reaches no later read.
let list = [1, 2];
const log = [];
const { from = (list = 'ab', 0), [(log.push(1), 'of')]: of } = Array;
export const last = list.at(-1);
export const made = [from([5]), of(6), log];
