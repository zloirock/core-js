// deep nesting: a dead default under a sound deep pair extracts the same way
let deepFb = {};
const [[{ Iterator: I } = deepFb]] = [[globalThis]];
export const viaDeepDeadDefault = I.range(0, 3);
