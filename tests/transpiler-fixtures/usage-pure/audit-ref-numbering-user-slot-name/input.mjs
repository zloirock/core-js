// a USER binding wearing a plugin slot-shaped name (`_ref2`) in a NESTED scope the
// allocator's use-site chain cannot see: allocation must still avoid it and the exit
// numbering repair must keep both emitters on identical ref names
function nest() {
  let _ref2 = globalThis.userThing;
  return _ref2;
}
export const r1 = globalThis.box.at(0);
export const r2 = globalThis.box2.flat();
export { nest };
