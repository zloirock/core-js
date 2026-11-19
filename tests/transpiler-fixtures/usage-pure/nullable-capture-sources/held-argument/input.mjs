// An alias retains the optional source guard when supplying a flat parameter.
const held = globalThis.window?.Array;
export const result = (({ from }) => from)(held);
