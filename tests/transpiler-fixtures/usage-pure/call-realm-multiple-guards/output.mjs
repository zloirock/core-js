import _globalThis from "@core-js/pure/actual/global-this";
// A declined static claim leaves the call-returned realm root live.
export const r = (() => _globalThis)().window?.self?.Promise.race;