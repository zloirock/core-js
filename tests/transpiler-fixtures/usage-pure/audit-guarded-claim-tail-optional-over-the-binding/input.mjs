// A guarded computed tail preserves its environment probe and any write inside that probe.
// The unwritten key needs no static namespace. Deeper nullable receivers retain optional steps;
// lowering can also leave a redundant optional step on a backed constructor.
let key, kept;
export const computedTailOverClaim = globalThis.window?.Map?.[key];
export const keptWriteTest = (kept = globalThis.window)?.Map?.[key];
export const deeperOptionalStays = globalThis.window?.self.Array?.prototype?.at;
export { kept };
