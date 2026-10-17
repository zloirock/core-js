import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// PLAIN claims through the sealed root ERASE receiverless like the alias spelling (the seal
// ends the inner chain; the plain read declares the value) - call, destructure and the
// claimable ctor value-use alike
export const viaSealedPlainCall = (globalThis.window?.self.window).Array.of(6).at(0);