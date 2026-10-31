// a read the source already gates on the probe-holding binding owes no probe - the guarded
// branch keeps the byte-clean erase; a function body escapes the gate and keeps the probe
const heldProbe = globalThis.window;
export const guardedRunRead = heldProbe ? heldProbe.Array.of(15) : null;
export function guardedFunctionBodyRead() { return heldProbe.Array.of(16); }
