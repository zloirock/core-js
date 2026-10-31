import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/web.self";
// a VALUE-OBSERVING carrier (`??`) between the guarded chain and the static keeps the read on
// the carrier RESULT (the fallback object may own the key) - no collapse past the carrier; the
// root SE runs once inside the kept test
const nc = () => globalThis;
export const viaNullishCarrier = (nc()?.window?.self ?? {
  Array
}).Array.of(29).at(0);