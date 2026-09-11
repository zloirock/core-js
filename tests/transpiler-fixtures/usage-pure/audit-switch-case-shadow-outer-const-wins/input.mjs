// an OUTER user binding above an invisible case-direct shadow still shadows: the case-let
// does not cover the discriminant, but the module-level const does - the shadow walk must
// continue ABOVE the invisible case binding to the outer declaration instead of reporting
// the name unbound. the slots are a STRING so the row says WHICH object was read: the user's
// answers the string family, the real global would answer the array one
const globalThis = { Array: { prototype: "abc" } };
let yb = {};
switch (globalThis.Array.prototype.at) {
  case 1:
    let globalThis = yb;
    break;
}
switch (globalThis.Array.prototype.includes) {
  case 2:
    let globalThis = yb;
    break;
}
export { yb };
