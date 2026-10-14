// A destructure host fills its pattern after its value runs, so a write in a default or a computed
// key of the pattern lands after a write in the value's sequence prefix though the source places it
// first - also where the rewrite lifts that prefix ahead of the declaration. A later read cannot take
// the prefix write's type.
let text = [1, 2];
const { from, other = (text = [3]) } = (text = 'ab', Array);
export const last = text.at(-1);
let list = 'cd';
const box = {};
({ [(list = 'ef', 'key')]: box.key } = (list = [5], box));
export const found = list.includes('e');
export const made = [from([4]), other];
