// the escape census files a slot write under the name written through, so a parameter shares the writes of
// a namesake parameter of another function: `fill` never takes `listed`, yet the unknown-key read through the
// parameter `keep` stores loads `Map`'s statics
function fill(box) {
  box.C = Map;
}
const listed = { C: Boolean };
let held;
function keep(box) {
  held = box;
}
keep(listed);
export const kept = held.C[key]([1], x => x);
