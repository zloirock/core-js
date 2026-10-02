import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A computed tail retains its key and throwing leaf while a known constructor uses its pure import.
// The unwritten local key holds undefined and needs no static namespace.
// The read and delete preserve the environment probe.
let key;
export const deleteOverComputedKey = delete (null == _globalThis.window ? void 0 : _Promise)?.[key].userSlot;
export const readOverComputedKey = null == _globalThis.window ? void 0 : _Promise[key].userSlot;