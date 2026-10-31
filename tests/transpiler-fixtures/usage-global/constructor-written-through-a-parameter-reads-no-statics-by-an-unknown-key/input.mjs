// a constructor a call writes into the container it passes to a parameter, read back by an unknown key -
// through the container, or through a binding the callee stored its parameter in - takes none of that
// constructor's statics, in either emitter: the escape census, which answers an unknown key with the
// whole family, does not follow what a call passes into a parameter
const filled = { C: Boolean };
function fill(box) {
  box.C = Map;
}
fill(filled);
export const any = filled.C[key]([1], x => x);
const inline = { C: Boolean };
(function (target) {
  target.C = Map;
})(inline);
export const once = inline.C[key]([1], x => x);
const listed = { C: Boolean };
listed.C = Map;
let held;
function keep(slot) {
  held = slot;
}
keep(listed);
export const kept = held.C[key]([1], x => x);
