// A nested parameter receives the original nullish value before rejecting it.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window?.self;
export const result = (({ Array: { from } }) => from)(held);
