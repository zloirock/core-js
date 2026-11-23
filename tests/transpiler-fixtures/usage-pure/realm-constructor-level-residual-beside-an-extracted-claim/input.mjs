// Read the constructor once after the prefix, then bind its method and native sibling.
// The assignment must also call mk once before reading the numeric property.
const { Array: { prototype: { at: a2 }, foo: b2 } } = (eff(), globalThis);
let f3, z3;
function mk() { return globalThis; }
({ Array: { of: f3, 0: z3 } } = mk());
export { a2, b2 };
