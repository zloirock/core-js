// the line-scoped opt-out reaches the guarded-navigation render too: that render INJECTS a
// ponyfilled root and leaf, so it is an injection and not the reprint compensation that has to run
// regardless. the undirected sibling of each row is the control, and the last row shows the
// directive covers only its own line
const kept = globalThis.window?.self.Array;
// core-js-disable-next-line
const optedOut = globalThis.window?.self.Map;
let stored;
// core-js-disable-next-line
const storedOptOut = (stored = globalThis.window)?.self.Set;
const after = globalThis.window?.self.Promise;
export { kept, optedOut, stored, storedOptOut, after };
