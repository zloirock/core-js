// a KEPT chain-assign VALUE collapses its pony hops whatever claim stands above it: the spelling is
// the value canon (`(k = globalThis.self.window)` stores `_self`), which the static claim
// beside these already read through. an instance claim used to leave the hop raw, each emitter for
// its own reason - one had no visitor left for the assignment once the claim subsumed it, the other
// deferred the collapse and then handed its helper a COPY the deferred flush could not match.
let k;
export const instanceCall = (k = globalThis.self.window).Array.prototype.at(0);
export const instanceGet = (k = globalThis.self.window).Array.prototype.at;
export const vestigialOptional = (k = globalThis.self?.window).Array.prototype.at(0);
export const { name } = (k = globalThis.self?.window).Array.prototype.at(0);

// the spelling both emitters already agreed on - the static claim reads the same collapsed value
export const staticClaim = (k = globalThis.self.window).Array.of;
// NEGATIVE: a value navigating a hop with NO ponyfill is not the global - target and value stay as
// written, only the value's own root substitutes
export const unponyfilledHop = (k = globalThis.window.self).Headers;
