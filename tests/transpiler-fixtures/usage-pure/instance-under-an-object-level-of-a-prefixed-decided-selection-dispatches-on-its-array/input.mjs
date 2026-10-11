// an instance method nested one level into a selection the build decides behind an effect prefix: the
// level reads off the value the selection yields, so the leaf dispatches on that array as it does for
// the array spelled alone
const user = {};
const { C: { at } } = (eff(), typeof Symbol != 'undefined' ? { C: [1] } : { C: user });
let flat;
({ C: { flat } } = (eff(), typeof Symbol != 'undefined' && { C: [2] }));
const { W: { C: { includes } } } = { W: (eff(), { C: [3] } || user) };
export { at, flat, includes };
