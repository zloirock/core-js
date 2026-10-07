// A `||` left read off the realm of a global the build does not serve leaves its right live on every
// destructuring host, and a key naming both an instance method and a static of the right's constructor
// takes the static's own entry on that arm: an assignment, a member target, a parameter default and its
// inner default, a call argument, an exported declaration and a leaf default.
let concat;
({ concat } = globalThis.WeakRef || Iterator);
const target = {};
({ entries: target.entries } = globalThis.WeakRef || Object);
export function pick({ values } = globalThis.WeakRef || Object) { return values; }
export function inner({ deep: { match } = globalThis.WeakRef || Symbol } = {}) { return match; }
(({ replace }) => use(replace))(globalThis.WeakRef || Symbol);
export const { split } = globalThis.WeakRef || Symbol;
const { search = null } = globalThis.WeakRef || Symbol;
export { concat, target, search };
