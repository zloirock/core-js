// a prototype read off a realm root is typed only while that root's own slot stands: after the file replaces the
// name (`window.self = other`) the root is the user's object and the dispatch is the generic one, while a read
// ahead of the replacement types like its twin - the root and each realm hop of its path asked where they are read
const { Array: { prototype: { at } } } = self;
export const destructured = at;
export const ahead = self.Array.prototype.includes;
export const hopAhead = globalThis.self.Array.prototype.flat;
window.self = other;
export const after = self.Array.prototype.at;
export const hopAfter = globalThis.self.Array.prototype.includes;
