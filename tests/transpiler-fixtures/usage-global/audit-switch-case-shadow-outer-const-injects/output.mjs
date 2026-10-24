import "core-js/modules/es.string.at";
// an OUTER user binding above the invisible case-direct shadow still shadows the global name
// at the discriminant: the walk continues ABOVE the invisible case binding to the outer const,
// so the receiver is the user's own object. the slot is a STRING so the row says which object was
// read - the user's answers `es.string.at`, the real global would answer the array family
const globalThis = {
  Array: {
    prototype: "abc"
  }
};
let yb = {};
switch (globalThis.Array.prototype.at) {
  case 1:
    let globalThis = yb;
    break;
}
export { yb };