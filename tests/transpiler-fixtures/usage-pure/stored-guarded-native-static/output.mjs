import _globalThis from "@core-js/pure/actual/global-this";
// A late anchor must not strand the nested static on a narrow constructor.
_globalThis.window = _globalThis;
let held;
export const {
  Promise: {
    resolve
  }
} = held = _globalThis.window?.self;