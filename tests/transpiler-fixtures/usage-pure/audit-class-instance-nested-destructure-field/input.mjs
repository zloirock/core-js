// a nested pattern hop off a CLASS INSTANCE reads the field the flat spelling reads: the walk has
// no literal to descend, so the container's member is asked of the member canon - the class body
// with its write fold - and `{ data: { at } } = c` narrows exactly as `{ at } = c.data` does.
// the written twin widens both spellings alike, and a second hop past the instance has no path
// to descend in either, so both stay generic there
class C {
  data = [1, [2]];
  box = { data: [1, [2]] };
}
const c = new C();
export const { data: { at: nested } } = c;
export const { at: flat } = c.data;
export const { box: { data: { at: nestedTwoHops } } } = c;
export const { at: flatTwoHops } = c.box.data;

class W {
  data = [1, [2]];
}
const w = new W();
w.data = 'str';
export const { data: { at: nestedWritten } } = w;
export const { at: flatWritten } = w.data;
