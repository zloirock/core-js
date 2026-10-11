// the escape census files a slot write under the name written through, so the write `wipe` makes through its
// parameter counts on the namesake container too: the static read off the slot stays served by name, and the
// constructor takes the entry carrying its statics instead of the narrow one
const box = { C: Map };
const held = box;
export const grouped = held.C.groupBy([1], x => x);
export function wipe(box) {
  box.C = null;
}
