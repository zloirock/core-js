// A nested parameter receives the original nullish value before rejecting it.
const held = globalThis.window?.self;
export const result = (({ Array: { from } }) => from)(held);
