// dynamic init: no pairing evidence at all - the live slot's static read is guarded against the
// default's candidate, the default is mirrored
const [d0, { Promise: P } = globalThis] = dyn;
export const viaDynamicInit = P.allSettled([]);
