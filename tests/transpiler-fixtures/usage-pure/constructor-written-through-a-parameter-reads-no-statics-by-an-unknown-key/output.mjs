import _Map from "@core-js/pure/actual/map";
// a constructor a call writes into the container it passes to a parameter, read back by an unknown key -
// through the container, or through a binding the callee stored its parameter in: usage-pure stores its
// namespace entry, statics included, since a slot written through a parameter, or one of a container a
// call takes, escapes - so whatever static the key names is there at runtime
const filled = {
  C: Boolean
};
function fill(box) {
  box.C = _Map;
}
fill(filled);
export const any = filled.C[key]([1], x => x);
const inline = {
  C: Boolean
};
(function (target) {
  target.C = _Map;
})(inline);
export const once = inline.C[key]([1], x => x);
const listed = {
  C: Boolean
};
listed.C = _Map;
let held;
function keep(slot) {
  held = slot;
}
keep(listed);
export const kept = held.C[key]([1], x => x);