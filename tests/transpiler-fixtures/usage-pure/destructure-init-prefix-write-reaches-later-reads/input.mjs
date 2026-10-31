// A write in the sequence prefix of a destructure init runs before the pattern binds anything.
// The rewrite consuming the whole pattern lifts that prefix ahead of the extraction, and every
// later read sees the write there: a constructor alias reads the written constructor's statics,
// a member read dispatches on the written value.
let Ctor = Array;
const { from } = (Ctor = Map, Array);
export const ctorGroupBy = Ctor.groupBy;
const box = { items: [1, 2] };
let of;
({ of } = (box.items = 'ab', Array));
export const last = box.items.at(-1);
export const made = [from([3]), of(4)];
