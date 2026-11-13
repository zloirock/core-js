// The caller census and the direct IIFE keep the same source guard.
const held = globalThis.window?.Array;
function read({ from }) { return from; }
export const result = read(held);
