// A write in the sequence prefix of a destructure initializer runs before the declaration binds
// anything, as a statement standing ahead of it would - which is where the rewrite moves it. A
// later read of the written binding takes the written value's type, after the declaration or in a
// later declarator of the same one.
let text = [1, 2];
const { from } = (text = 'ab', Array);
export const last = text.at(-1);
let list = 'cd';
if (ready) {
  const { of } = (list = [3, 4], Array), found = list.includes(3);
  use(of, found);
}
export const made = from([5]);
