// an OUTER user binding above the invisible case-direct shadow still shadows the global name
// at the discriminant: the walk continues ABOVE the invisible case binding to the outer const,
// so the receiver is the user's own object - a raw-global read here injected `es.global-this`
// on a shadowed name and dropped the iterator machinery the user-object dispatch derives
const globalThis = { Array: { prototype: { flatMap: 1 } } };
let yb = {};
switch (globalThis.Array.prototype.flatMap) {
  case 1:
    let globalThis = yb;
    break;
}
export { yb };
