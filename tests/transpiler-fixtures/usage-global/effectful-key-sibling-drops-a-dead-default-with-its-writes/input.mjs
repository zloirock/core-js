// A default on a leaf whose static the build serves never runs, an effectful computed key beside it
// notwithstanding: a write in it reaches no later read, which loads no string module for it.
let list = [1, 2];
const log = [];
const { from = (list = 'ab', 0), [(log.push(1), 'of')]: of } = Array;
export const last = list.at(-1);
export const made = [from([5]), of(6), log];
