// A proxy-global receiver wrapped in a transparent value position (array element, object-literal value
// read back through a member) collapses its redundant `.self` hop to the pure global root
// (`globalThis.self.Array.prototype` -> `_globalThis.Array.prototype`), never a raw read off-engine (ie:11).
// the unwrapped receiver is a single concrete Array.prototype, so multi-type methods (includes, at) narrow
// to the array variant - proving the type resolves THROUGH the wrapper. distinct method per line.
const arrayElem = [globalThis.self.Array.prototype][0].includes.call([1], 1);
const objMember = { box: globalThis.self.Array.prototype }.box.at.call([1], 0);
export { arrayElem, objMember };
