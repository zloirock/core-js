// a selection arm that is a name holding several values - a for-of head over a literal, a name a
// selection or a write set - is no constructor the destructure can mirror: it stays as written, spelled
// as the arm or in a container arm's slot, and a static read off it reads the binding pure swapped in, so
// that constructor takes the entry carrying its own statics. a head over built-ins left of a `||` is the
// whole value, its right dead, and is read as the head alone, through its guard. a name holding one value
// is mirrored
for (const M of [Map, Set]) {
  const { groupBy } = M || Object;
  use(groupBy);
}
const P = c ? Promise : box;
export const { try: viaSelected } = d ? P : Object;
let I = Iterator;
if (c) I = box;
export const { from: viaWritten } = I || Array;
for (const S of [Symbol, Set]) {
  const { C: { for: viaContainerSlot } } = c ? { C: S } : box;
  use(viaContainerSlot);
}
const U = URL;
export const { canParse: viaOne } = c ? U : box;
