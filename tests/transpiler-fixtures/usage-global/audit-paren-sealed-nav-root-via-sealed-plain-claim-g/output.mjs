import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// the PLAIN-seal claim / destructure / synth classes inject their statics too (usage-global
// only adds imports; the sealed read stays user-code) - the over-inject-safe verdict
export const viaSealedPlainClaimG = (globalThis.window?.self.window).Array.of(6).at(0);