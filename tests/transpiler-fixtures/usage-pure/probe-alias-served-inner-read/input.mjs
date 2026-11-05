// A held window probe is still read before its Promise.resolve claim.
// Serving the inner static must preserve the source failure when that probe is absent.
const held = globalThis.window;
export const value = typeof held.Promise.resolve;
