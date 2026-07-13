import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// an OUTER user binding above an invisible case-direct shadow still shadows: the case-let
// does not cover the discriminant, but the module-level const does - the shadow walk must
// continue ABOVE the invisible case binding to the outer declaration instead of reporting
// the name unbound (a raw-global rewrite would read the real global instead of the user's
// own object). only the extraction wrapper is injected; the receiver text stays untouched
const globalThis = {
  Array: {
    prototype: {
      at: 1,
      includes: 2
    }
  }
};
let yb = {};
switch (_at(globalThis.Array.prototype)) {
  case 1:
    let globalThis = yb;
    break;
}
switch (_includes(globalThis.Array.prototype)) {
  case 2:
    let globalThis = yb;
    break;
}
export { yb };