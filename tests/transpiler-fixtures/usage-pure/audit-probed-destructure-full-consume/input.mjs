// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
export const { Math: { cbrt: viaMultiPropA }, Object: { seal: viaMultiPropB } } = (globalThis.window?.self);
export const { structuredClone: viaFlatBareNav } = (globalThis.window?.self);
export const [{ Math: { hypot: viaArrayWrapped } }] = [(globalThis.window?.self)];
let viaAssignFull;
({ Math: { sign: viaAssignFull } } = (globalThis.window?.self));
export { viaAssignFull };
