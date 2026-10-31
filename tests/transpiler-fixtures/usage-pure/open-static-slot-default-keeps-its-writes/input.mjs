// A default on a static the build serves still runs where its slot may read `undefined`: off a name a
// write may point elsewhere, off a selection whose other arm lacks the static, over a slot the file
// writes, on a line the user opted out of. A write in it reaches a later read, which takes the helpers
// that write brings.
let a = [1], b = [2], c = 'ef', d = 'gh';
let R = Array;
if (flag) R = Set;
const { from = (a = 'ab', 0) } = R;
const { of = (b = 'cd', 0) } = flag ? Array : Math;
Promise.allSettled = shim;
const { allSettled = (c = [3], 0) } = Promise;
// core-js-disable-next-line
const { entries = (d = [4], 0) } = Object;
export const reads = [a.at(0), b.includes(1), c.flat(), d.toReversed()];
export { from, of, allSettled, entries };
