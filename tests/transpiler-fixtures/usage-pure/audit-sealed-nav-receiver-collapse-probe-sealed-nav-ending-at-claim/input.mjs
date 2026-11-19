// a seal over a nav that ENDS AT the claim has no hop leaf for the nav plan to render, so the
// guard is built from the erase verdict's own `?.` object with the claim's ponyfill as the
// always-defined alternate - the read the seal makes observable survives either way
export const sealedNavEndingAtClaim = (globalThis.window?.self.Promise).resolve;
