// writes that are NOT a patch of the namespace, and so must leave its narrows intact. a write rooted
// at `this` INSIDE a function targets the receiver, never the global object; an alias of a namespace
// MEMBER is that member, so writing its slot can never reach a namespace slot - a DYNAMIC member of
// an ordinary object cannot be a namespace either, while off the global object it still could. all
// rows resolve
// through `Object.create`, which stays pristine here - a regression on either distinction shows up
// as the typeless row riding. distinct method per line so each row is attributable
function receiverWrite() {
  Object.assign(this, { Object: replacement });
}
var cos = Math.cos;
cos.marker = 1;
var dynamicMember = lib[key];
dynamicMember.create = replacement;
var fromPristineCreate = Object.create(Array.prototype);
export const a = fromPristineCreate.at(0);
var alsoPristine = Object.create(Array.prototype);
export const b = alsoPristine.includes(1);
