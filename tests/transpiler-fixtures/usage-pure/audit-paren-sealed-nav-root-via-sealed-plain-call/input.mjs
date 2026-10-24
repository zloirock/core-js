// PLAIN claims through the sealed root claim receiverless, but the erase re-emits the read
// the source performs on the sealed VALUE as a THROW probe ahead of the claim: an absent
// `window` throws at the probe exactly as the source does, a present one reads through the
// ponyfill and drops the value - call, destructure and the claimable ctor value-use alike
export const viaSealedPlainCall = (globalThis.window?.self.window).Array.of(6).at(0);
