// a container or a realm root written in the arm a decided presence test always takes holds that value
// at the read, so the static read off it claims its pure static - a member read and a destructure alike.
// an undecided test may leave the init in place, so its read stays native
let box = { C: Object };
if (typeof Promise != 'undefined') box = { C: Map };
export const grouped = () => box.C.groupBy([1], x => x);
let root;
if (typeof globalThis != 'undefined') root = globalThis;
export const fromRoot = () => {
  const { from } = root.Array;
  return from([1]);
};
let maybe = { C: Object };
if (flag) maybe = { C: Array };
export const undecided = () => maybe.C.of(1);
