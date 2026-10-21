// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims.
let deepFb = {};
const [[{ Iterator: I } = deepFb]] = [[globalThis]];
export const viaDeepDeadDefault = I.range(0, 3);
