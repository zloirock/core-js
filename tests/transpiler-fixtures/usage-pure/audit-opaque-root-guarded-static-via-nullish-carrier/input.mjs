// a VALUE-OBSERVING carrier (`??`) between the guarded chain and the static keeps the read on
// the carrier RESULT (the fallback object may own the key): the static is read off the carrier
// once and dispatched by IDENTITY - the realm constructor takes the ponyfill, any other value its
// own raw read - and the root SE runs once inside the kept test
const nc = () => globalThis;
export const viaNullishCarrier = (nc()?.window?.self ?? { Array }).Array.of(29).at(0);
