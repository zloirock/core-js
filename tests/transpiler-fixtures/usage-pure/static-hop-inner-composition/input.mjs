// An instance leaf under a static reads through that static's ponyfill.
// A dead pattern default must not hide the live leaf claim; siblings read the same pure value.
const { Array: { of: { name: viaHop } = {} } = {} } = globalThis;
const { Array: { of: { name: viaNoOuterDefault } = {} } } = globalThis;
const { Array: { of: { name: viaNoDefault } } } = globalThis;
const { of: { name: viaMemberInit } = {} } = globalThis.Array;
const { of: { name: viaMemberInitBare } } = globalThis.Array;
let viaAssign;
({ Array: { of: { name: viaAssign } = {} } = {} } = globalThis);
const { of: { name: withSibling, foo } = {} } = Array;
const { Array: { of: { name: hopWithSibling, length } } } = globalThis;
export { viaHop, viaNoOuterDefault, viaNoDefault, viaMemberInit, viaMemberInitBare, viaAssign, withSibling, foo, hopWithSibling, length };
