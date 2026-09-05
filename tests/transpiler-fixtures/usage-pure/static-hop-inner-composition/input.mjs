// an instance leaf under a STATIC hop composes off the static's ponyfill - an import binding, always
// defined - so an inner default folds through the static guard and never mirrors a dead branch. the
// constructor may stand behind hops of its own or be the init's own member read, and leaf siblings
// take the flat twin off one memo of that same ponyfill
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
