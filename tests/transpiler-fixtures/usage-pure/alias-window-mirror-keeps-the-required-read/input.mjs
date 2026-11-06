// An immutable alias can hold an absent window on either pass.
const w = globalThis.window;
let from;
({ Array: { from } } = w.globalThis);
export { from };
