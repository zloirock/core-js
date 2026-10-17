// NEGATIVE: no seal, so the whole navigation collapses and the claim needs no guard at all
export const unsealedRoot = (globalThis.window.self)?.window.Promise.resolve(1);
