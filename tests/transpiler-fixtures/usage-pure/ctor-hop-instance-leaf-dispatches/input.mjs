// A leaf that is an INSTANCE member of the function a ctor hop names reads THROUGH that hop
// (`{ Promise: { name } }` reads `Function.prototype.name` off the constructor), and the
// untouched-ctor re-anchor never does: it re-homes the RESIDUAL onto the constructor's pure
// binding and dispatches nothing, so such a leaf bound `_Promise.name` raw - undefined on a floor
// without it - where the dispatch answers. Every host that can host the extraction answers alike.
// The negatives are what keeps the dispatch off a NAME MATCH: a leaf the constructor's own type
// does not carry raises no claim at all and stays a read off the surface, and a USER object whose
// capitalised key merely looks like that surface resolves no pure base and keeps its own read.
const { Promise: { name: viaDeclaration } } = globalThis;
let viaAssignment;
({ Promise: { name: viaAssignment } } = globalThis);
const { ArrayBuffer: { name: viaRealmNav } } = globalThis;
const { Array: { keys: nameMatchStaysNative } } = globalThis;
const source = makeSource();
const { Object: { keys: userKeyStaysNative } } = source;
export { viaDeclaration, viaAssignment, viaRealmNav, nameMatchStaysNative, userKeyStaysNative };
