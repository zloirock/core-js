// A computed tail retains its key and throwing leaf while a known constructor uses its pure import.
// The unwritten local key holds undefined and needs no static namespace.
// The read and delete preserve the environment probe.
let key;
export const deleteOverComputedKey = delete globalThis.window?.self?.Promise[key].userSlot;
export const readOverComputedKey = globalThis.window?.self?.Promise[key].userSlot;
