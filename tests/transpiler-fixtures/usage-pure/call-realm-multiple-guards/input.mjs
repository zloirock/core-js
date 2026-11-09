// A declined static claim leaves the call-returned realm root live.
export const r = (() => globalThis)().window?.self?.Promise.race;
