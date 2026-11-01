// Excluding the constructor and its static leaves the original slot and default untouched.
// A static that the filter keeps still replaces its slot and retires that level's default.
const { Iterator: { from } = Array } = globalThis;
const { Map: { groupBy } = Object } = globalThis;
export { from, groupBy };
