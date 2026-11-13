// An alias retains the optional source guard when supplying a flat parameter.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window?.Array;
export const result = (({ from }) => from)(held);
