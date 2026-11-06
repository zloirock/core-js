// Fully consumed realm patterns retain the probe read that can throw before extraction.
// The array-contained static remains native and performs its own read.
export const { Math: { cbrt: viaMultiPropA }, Object: { seal: viaMultiPropB } } = (globalThis.window?.self);
export const { structuredClone: viaFlatBareNav } = (globalThis.window?.self);
export const [{ Math: { hypot: viaArrayWrapped } }] = [(globalThis.window?.self)];
let viaAssignFull;
({ Math: { sign: viaAssignFull } } = (globalThis.window?.self));
export { viaAssignFull };
