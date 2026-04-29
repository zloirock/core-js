// `globalThis ||= ...` logical-assignment shadowing the global: the read in the LHS
// still resolves to the polyfill receiver before the write.
const globalThis = { Map: {} };
globalThis.Map ||= {};
